import type { AuditFinding, Severity } from "@/types/audit";

const PENALTIES: Record<Severity, number> = {
  critical: 25,
  high: 15,
  medium: 8,
  low: 4,
  info: 2,
};

export function computeSecurityScore(findings: AuditFinding[]): number {
  let score = 100;
  const counted = new Set<string>();

  for (const f of findings) {
    const key = `${f.category}-${f.lines.join("-")}`;
    if (counted.has(key)) continue;
    counted.add(key);
    score -= PENALTIES[f.severity];
  }

  return Math.max(0, Math.min(100, score));
}

export function scoreToGrade(score: number): string {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  if (score >= 50) return "E";
  return "F";
}

export function buildSummary(findings: AuditFinding[], score: number): string {
  if (findings.length === 0) {
    return "No common vulnerability patterns detected. Manual review and formal testing are still recommended before mainnet deployment.";
  }
  const critical = findings.filter((f) => f.severity === "critical").length;
  const high = findings.filter((f) => f.severity === "high").length;
  return `Security score ${score}/100. Found ${findings.length} issue(s) including ${critical} critical and ${high} high severity. Address critical and high findings before deployment.`;
}
