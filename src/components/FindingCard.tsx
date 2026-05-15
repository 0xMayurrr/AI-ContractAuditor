"use client";

import type { AuditFinding } from "@/types/audit";
import { CATEGORY_LABELS, cn, SEVERITY_STYLES } from "@/lib/utils";
import { AlertTriangle, Code2, Lightbulb } from "lucide-react";

interface FindingCardProps {
  finding: AuditFinding; active?: boolean; onSelect?: () => void;
}

const ACCENT: Record<string, string> = { critical: "bg-red-500", high: "bg-orange-500", medium: "bg-amber-500", low: "bg-blue-500", info: "bg-zinc-500" };
const ACTIVE_RING: Record<string, string> = { critical: "ring-red-500/25", high: "ring-orange-500/25", medium: "ring-amber-500/25", low: "ring-blue-500/25", info: "ring-zinc-500/25" };
const TOP_GLOW: Record<string, string> = {
  critical: "bg-gradient-to-r from-transparent via-red-500 to-transparent",
  high:     "bg-gradient-to-r from-transparent via-orange-500 to-transparent",
  medium:   "bg-gradient-to-r from-transparent via-amber-500 to-transparent",
  low:      "bg-gradient-to-r from-transparent via-blue-500 to-transparent",
  info:     "bg-gradient-to-r from-transparent via-zinc-500 to-transparent",
};

export function FindingCard({ finding, active, onSelect }: FindingCardProps) {
  const styles = SEVERITY_STYLES[finding.severity];
  return (
    <article
      role="button" tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => e.key === "Enter" && onSelect?.()}
      className={cn(
        "group relative cursor-pointer overflow-hidden rounded-xl border transition-all duration-200",
        "bg-[#080e0a] hover:bg-[#0a1210]",
        "border-green-500/8 hover:border-green-500/20",
        "hover:shadow-lg hover:shadow-green-500/5 hover:-translate-y-0.5",
        active && cn("ring-1 shadow-lg -translate-y-0.5", ACTIVE_RING[finding.severity])
      )}
    >
      {/* left accent */}
      <div className={cn("absolute inset-y-0 left-0 w-[3px]", ACCENT[finding.severity])} />
      {/* top glow line */}
      <div className={cn("absolute inset-x-0 top-0 h-px opacity-30 transition-opacity group-hover:opacity-70", TOP_GLOW[finding.severity])} />

      <div className="p-4 pl-5">
        <div className="flex items-start gap-3">
          <div className={cn("mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-transform group-hover:scale-105", styles.bg)}>
            <AlertTriangle className={cn("h-4 w-4", styles.text)} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className={cn("rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider", styles.bg, styles.text, finding.severity === "critical" && "badge-critical", finding.severity === "high" && "badge-high", finding.severity === "medium" && "badge-medium")}>
                {finding.severity}
              </span>
              <span className="rounded bg-white/5 px-1.5 py-0.5 text-[9px] text-zinc-600">{CATEGORY_LABELS[finding.category] ?? finding.category}</span>
              {finding.lines.length > 0 && (
                <div className="ml-auto flex items-center gap-1">
                  <Code2 className="h-2.5 w-2.5 text-green-600" />
                  <span className="font-mono text-[9px] text-green-600">L{finding.lines.join(", ")}</span>
                </div>
              )}
            </div>
            <h3 className="mt-2 text-[13px] font-semibold leading-snug text-zinc-100">{finding.title}</h3>
          </div>
        </div>

        <p className="mt-3 text-[11.5px] leading-relaxed text-zinc-500">{finding.explanation}</p>

        <div className="mt-3 rounded-lg border border-green-500/10 bg-green-500/[0.04] p-3">
          <div className="mb-1.5 flex items-center gap-1.5">
            <Lightbulb className="h-3 w-3 text-green-500/60" />
            <span className="text-[9px] font-bold uppercase tracking-wider text-green-600">Fix</span>
          </div>
          <p className="text-[11px] leading-relaxed text-green-100/50">{finding.recommendation}</p>
        </div>

        {finding.snippet && (
          <pre className="mt-3 overflow-x-auto rounded-lg border border-white/5 bg-black/40 p-2.5 font-mono text-[10px] text-zinc-700">
            <span className="text-zinc-800 select-none">&gt; </span>{finding.snippet}
          </pre>
        )}
      </div>
    </article>
  );
}
