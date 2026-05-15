import type { AuditFinding, Severity, VulnerabilityCategory } from "@/types/audit";

interface PatternRule {
  category: VulnerabilityCategory;
  title: string;
  severity: Severity;
  explanation: string;
  recommendation: string;
  regex: RegExp;
  multiline?: boolean;
}

function lineNumbersForMatch(code: string, matchIndex: number): number[] {
  const before = code.slice(0, matchIndex);
  const line = before.split("\n").length;
  return [line];
}

function snippetAtLine(code: string, line: number): string {
  const lines = code.split("\n");
  const idx = line - 1;
  if (idx < 0 || idx >= lines.length) return "";
  return lines[idx].trim();
}

function makeFinding(
  code: string,
  rule: PatternRule,
  matchIndex: number,
  suffix = ""
): AuditFinding {
  const lines = lineNumbersForMatch(code, matchIndex);
  const id = `${rule.category}-${lines[0]}-${matchIndex}`;
  return {
    id: id + suffix,
    category: rule.category,
    title: rule.title,
    severity: rule.severity,
    explanation: rule.explanation,
    recommendation: rule.recommendation,
    lines,
    snippet: snippetAtLine(code, lines[0]),
  };
}

const RULES: PatternRule[] = [
  {
    category: "reentrancy",
    title: "Potential reentrancy via external call",
    severity: "critical",
    explanation:
      "An external call (e.g. .call{value:}) may invoke untrusted code before state is finalized, allowing recursive withdrawals or inconsistent balances.",
    recommendation:
      "Follow checks-effects-interactions: update storage first, then call external addresses. Use OpenZeppelin ReentrancyGuard or a reentrancy mutex.",
    regex: /\.call\s*\{[^}]*value\s*:/gi,
  },
  {
    category: "reentrancy",
    title: "External transfer before state update",
    severity: "high",
    explanation:
      "Sending ETH with transfer/send/call before updating balances can enable reentrancy if the recipient is a malicious contract.",
    recommendation:
      "Move balance/accounting updates before external transfers and prefer pull-over-push payment patterns.",
    regex: /(transfer|send)\s*\([^)]*\)\s*;[\s\S]{0,120}(balance|amount)\s*[-=]/gi,
    multiline: true,
  },
  {
    category: "tx-origin",
    title: "Authentication via tx.origin",
    severity: "high",
    explanation:
      "tx.origin returns the original EOA, not the immediate caller. Phishing contracts can trick users into approving malicious flows.",
    recommendation:
      "Use msg.sender for authorization. If you need contract callers, implement explicit role-based access control.",
    regex: /\btx\.origin\b/gi,
  },
  {
    category: "unsafe-external-call",
    title: "Unchecked low-level call return value",
    severity: "high",
    explanation:
      "Low-level .call() returns (success, data). Ignoring success may leave the contract in an inconsistent state after a failed call.",
    recommendation:
      "Check the boolean success flag: (bool ok, ) = target.call{...}(...); require(ok, \"call failed\");",
    regex: /\.call\s*(\{[^}]*\})?\s*\([^)]*\)\s*;/gi,
  },
  {
    category: "unchecked-low-level-call",
    title: "delegatecall to user-controlled target",
    severity: "critical",
    explanation:
      "delegatecall executes code in the caller's context. A malicious implementation can overwrite storage and drain funds.",
    recommendation:
      "Never delegatecall to arbitrary addresses. Use immutable, audited library implementations only.",
    regex: /\.delegatecall\s*\(/gi,
  },
  {
    category: "unsafe-external-call",
    title: "selfdestruct usage",
    severity: "medium",
    explanation:
      "selfdestruct can force-send ETH and destroy contract logic; it is deprecated and complicates upgrade paths.",
    recommendation:
      "Avoid selfdestruct; use explicit withdrawal patterns and pausable emergency stops instead.",
    regex: /\bselfdestruct\s*\(/gi,
  },
  {
    category: "access-control",
    title: "Sensitive function lacks access modifier",
    severity: "high",
    explanation:
      "Functions that withdraw funds or change ownership appear callable by any address without onlyOwner/onlyRole-style checks.",
    recommendation:
      "Add modifiers (onlyOwner, onlyRole) and centralize access control with OpenZeppelin AccessControl.",
    regex:
      /function\s+(withdraw|setOwner|transferOwnership|mint|burn|pause|unpause|upgrade)\s*\([^)]*\)\s*(external|public)(?![\s\S]{0,80}(onlyOwner|onlyRole|require\s*\(\s*msg\.sender))/gi,
    multiline: true,
  },
  {
    category: "access-control",
    title: "tx.origin used in require for auth",
    severity: "critical",
    explanation:
      "Combining require(tx.origin == ...) with privileged operations is a well-known phishing vulnerability.",
    recommendation:
      "Replace with msg.sender checks and role-based permissions.",
    regex: /require\s*\(\s*tx\.origin/gi,
  },
  {
    category: "integer-overflow",
    title: "Unchecked arithmetic (pre-0.8)",
    severity: "medium",
    explanation:
      "Solidity <0.8 does not revert on overflow/underflow by default unless SafeMath is used consistently.",
    recommendation:
      "Use pragma solidity ^0.8.0 or apply OpenZeppelin SafeMath for all arithmetic.",
    regex: /pragma\s+solidity\s+[\^~]?0\.(4|5|6|7)\./gi,
  },
  {
    category: "integer-overflow",
    title: "Arithmetic without SafeMath (legacy)",
    severity: "medium",
    explanation:
      "Addition/subtraction on balances without SafeMath on older compiler versions can wrap around.",
    recommendation:
      "Migrate to Solidity 0.8+ or wrap operations with SafeMath.add/sub/mul/div.",
    regex: /\b(\w+)\s*(\+=|-=|\*=|\/=)\s*[^;]+;/gi,
  },
];

function hasSolidity08(code: string): boolean {
  return /pragma\s+solidity\s+[\^~]?0\.(8|9|10|11|12)/i.test(code);
}

function isUncheckedCallLine(line: string): boolean {
  const trimmed = line.trim();
  if (!/\.call\s*(\{|\()/i.test(trimmed)) return false;
  if (/require\s*\(|if\s*\(|!\s*\w+|success|ok\b/i.test(trimmed)) return false;
  return true;
}

export function analyzeSolidity(code: string): AuditFinding[] {
  const findings: AuditFinding[] = [];
  const seen = new Set<string>();

  for (const rule of RULES) {
    if (rule.category === "integer-overflow" && rule.title.includes("Arithmetic")) {
      if (hasSolidity08(code)) continue;
    }

    const flags = rule.multiline ? "gis" : "gi";
    const regex = new RegExp(rule.regex.source, flags);
    let match: RegExpExecArray | null;
    let n = 0;

    while ((match = regex.exec(code)) !== null) {
      if (rule.category === "unsafe-external-call" && rule.title.includes("Unchecked")) {
        const line = lineNumbersForMatch(code, match.index)[0];
        const lineText = code.split("\n")[line - 1] ?? "";
        if (!isUncheckedCallLine(lineText)) continue;
      }

      const finding = makeFinding(code, rule, match.index, `-${n}`);
      const key = `${finding.category}:${finding.lines.join(",")}:${finding.title}`;
      if (!seen.has(key)) {
        seen.add(key);
        findings.push(finding);
      }
      n++;
      if (!rule.multiline) break;
    }
  }

  const lines = code.split("\n");
  lines.forEach((line, i) => {
    if (isUncheckedCallLine(line)) {
      const rule = RULES.find((r) => r.title.includes("Unchecked low-level"));
      if (!rule) return;
      const key = `unchecked:${i + 1}`;
      if (seen.has(key)) return;
      seen.add(key);
      findings.push({
        id: `unchecked-call-${i + 1}`,
        category: "unchecked-low-level-call",
        title: "Unchecked low-level call",
        severity: "high",
        explanation: rule.explanation,
        recommendation: rule.recommendation,
        lines: [i + 1],
        snippet: line.trim(),
      });
    }
  });

  const severityOrder: Record<string, number> = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
    info: 4,
  };

  return findings.sort(
    (a, b) => severityOrder[a.severity] - severityOrder[b.severity]
  );
}

export function extractContractName(code: string): string {
  const match = code.match(/contract\s+(\w+)/);
  return match?.[1] ?? "UnnamedContract";
}
