import { analyzeSolidity, extractContractName } from "./patterns";
import {
  buildSummary,
  computeSecurityScore,
  scoreToGrade,
} from "./score";
import type { AuditReport } from "@/types/audit";

export function runAudit(code: string): AuditReport {
  const trimmed = code.trim();
  const findings = analyzeSolidity(trimmed);
  const securityScore = computeSecurityScore(findings);
  const contractName = extractContractName(trimmed);
  const lineCount = trimmed ? trimmed.split("\n").length : 0;

  return {
    id: crypto.randomUUID(),
    contractName,
    analyzedAt: new Date().toISOString(),
    securityScore,
    grade: scoreToGrade(securityScore),
    summary: buildSummary(findings, securityScore),
    findings,
    lineCount,
    aiEnhanced: false,
  };
}

export { analyzeSolidity, extractContractName };
