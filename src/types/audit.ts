export type Severity = "critical" | "high" | "medium" | "low" | "info";

export type VulnerabilityCategory =
  | "reentrancy"
  | "tx-origin"
  | "unsafe-external-call"
  | "access-control"
  | "integer-overflow"
  | "unchecked-low-level-call";

export interface AuditFinding {
  id: string;
  category: VulnerabilityCategory;
  title: string;
  severity: Severity;
  explanation: string;
  recommendation: string;
  lines: number[];
  snippet?: string;
}

export interface AuditReport {
  id: string;
  contractName: string;
  analyzedAt: string;
  securityScore: number;
  grade: string;
  summary: string;
  findings: AuditFinding[];
  lineCount: number;
  aiEnhanced: boolean;
}

export interface AuditRequest {
  code: string;
}
