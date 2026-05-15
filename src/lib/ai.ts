import type { AuditFinding, AuditReport } from "@/types/audit";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

const SYSTEM_PROMPT = `You are AURA-09, an expert Solidity smart contract security auditor with deep knowledge of EVM vulnerabilities, DeFi attack vectors, and blockchain security best practices.

Analyze the provided Solidity contract and return a JSON audit report with this EXACT structure:
{
  "contractName": "string",
  "securityScore": number (0-100),
  "grade": "A" | "B" | "C" | "D" | "F",
  "summary": "string (2-3 sentences)",
  "findings": [
    {
      "id": "string (unique, e.g. VULN-001)",
      "category": "reentrancy" | "tx-origin" | "unsafe-external-call" | "access-control" | "integer-overflow" | "unchecked-low-level-call",
      "title": "string (concise title)",
      "severity": "critical" | "high" | "medium" | "low" | "info",
      "explanation": "string (detailed technical explanation, 2-4 sentences)",
      "recommendation": "string (specific actionable fix)",
      "lines": [number],
      "snippet": "string (the vulnerable code snippet)"
    }
  ]
}

Scoring guide:
- Start at 100, Critical: -25, High: -15, Medium: -8, Low: -4
- Grade: A=90+, B=80+, C=70+, D=60+, F=below 60

Check for: reentrancy, access control, integer overflow, unsafe external calls,
front-running, flash loan vectors, oracle manipulation, timestamp dependence,
gas griefing, improper input validation.

Return ONLY valid JSON. No markdown, no text outside JSON.`;

// ── Helpers ────────────────────────────────────────────────────────────────

function extractContractName(code: string): string {
  return code.match(/contract\s+(\w+)/)?.[1] ?? "UnnamedContract";
}

function scoreToGrade(score: number): string {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}

function isQuotaError(status: number, body: string): boolean {
  // 429 = rate limit / quota exceeded
  return status === 429 || body.includes("insufficient_quota") || body.includes("rate_limit");
}

// ── Primary: Full GPT audit ────────────────────────────────────────────────

export async function runAIAudit(code: string): Promise<AuditReport | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  let res: Response;
  try {
    res = await fetch(OPENAI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
        temperature: 0.1,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `Audit this Solidity contract:\n\n\`\`\`solidity\n${code.slice(0, 15000)}\n\`\`\``,
          },
        ],
      }),
      signal: AbortSignal.timeout(25000),
    });
  } catch {
    // Network error, timeout → return null so static fallback kicks in
    return null;
  }

  // Quota exceeded or rate limited → return null, static fallback will run
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    if (isQuotaError(res.status, body)) {
      console.warn("OpenAI quota exceeded — falling back to static analysis");
    }
    return null;
  }

  try {
    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };

    const content = data.choices?.[0]?.message?.content;
    if (!content) return null;

    const parsed = JSON.parse(content) as {
      contractName?: string;
      securityScore?: number;
      grade?: string;
      summary?: string;
      findings?: AuditFinding[];
    };

    const findings: AuditFinding[] = (parsed.findings ?? []).map((f, i) => ({
      id: f.id ?? `VULN-${String(i + 1).padStart(3, "0")}`,
      category: f.category ?? "unsafe-external-call",
      title: f.title ?? "Unknown vulnerability",
      severity: f.severity ?? "medium",
      explanation: f.explanation ?? "",
      recommendation: f.recommendation ?? "",
      lines: Array.isArray(f.lines) ? f.lines : [],
      snippet: f.snippet ?? "",
    }));

    const score = Math.max(0, Math.min(100, parsed.securityScore ?? 50));

    return {
      id: crypto.randomUUID(),
      contractName: parsed.contractName ?? extractContractName(code),
      analyzedAt: new Date().toISOString(),
      securityScore: score,
      grade: parsed.grade ?? scoreToGrade(score),
      summary: parsed.summary ?? "",
      findings,
      lineCount: code.split("\n").length,
      aiEnhanced: true,
    };
  } catch {
    return null;
  }
}

// ── Secondary: Enrich static findings with AI explanations ────────────────

export async function enhanceFindingsWithAI(
  code: string,
  findings: AuditFinding[]
): Promise<{ findings: AuditFinding[]; enhanced: boolean }> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || findings.length === 0) return { findings, enhanced: false };

  let res: Response;
  try {
    res = await fetch(OPENAI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              'You are a smart contract security expert. Given findings and code, return JSON: { "insights": [{ "id": "finding-id", "explanation": "enhanced explanation", "recommendation": "specific fix" }] }. Be specific and technical.',
          },
          {
            role: "user",
            content: JSON.stringify({
              findings: findings.map((f) => ({
                id: f.id,
                title: f.title,
                lines: f.lines,
                severity: f.severity,
                snippet: f.snippet,
              })),
              code: code.slice(0, 8000),
            }),
          },
        ],
      }),
      signal: AbortSignal.timeout(15000),
    });
  } catch {
    return { findings, enhanced: false };
  }

  if (!res.ok) return { findings, enhanced: false };

  try {
    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = data.choices?.[0]?.message?.content;
    if (!content) return { findings, enhanced: false };

    const parsed = JSON.parse(content) as {
      insights?: { id: string; explanation: string; recommendation: string }[];
    };

    const enriched = findings.map((f) => {
      const insight = (parsed.insights ?? []).find((i) => i.id === f.id);
      if (!insight) return f;
      return {
        ...f,
        explanation: insight.explanation || f.explanation,
        recommendation: insight.recommendation || f.recommendation,
      };
    });

    return { findings: enriched, enhanced: true };
  } catch {
    return { findings, enhanced: false };
  }
}
