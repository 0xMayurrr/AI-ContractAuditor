"use client";

import { useState } from "react";
import type { AuditReport } from "@/types/audit";
import { Check, Copy, Download, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function ShareReport({ report }: { report: AuditReport | null }) {
  const [copied, setCopied] = useState<"json" | "link" | null>(null);
  if (!report) return null;

  const json = JSON.stringify(report, null, 2);
  const url = typeof window !== "undefined"
    ? `${window.location.origin}/?report=${encodeURIComponent(btoa(unescape(encodeURIComponent(json.slice(0, 8000)))))}`
    : "";

  const copy = async (type: "json" | "link") => {
    await navigator.clipboard.writeText(type === "json" ? json : url);
    setCopied(type); setTimeout(() => setCopied(null), 2000);
  };

  const download = () => {
    const blob = new Blob([json], { type: "application/json" });
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: `audit-${report!.contractName}-${Date.now()}.json` });
    a.click(); URL.revokeObjectURL(a.href);
  };

  const btn = (active: boolean, green?: boolean) => cn(
    "inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-[11px] font-medium transition-all duration-150",
    active ? "border-green-500/30 bg-green-500/10 text-green-400"
    : green ? "border-green-500/20 bg-green-500/5 text-green-500 hover:bg-green-500/10"
    : "border-white/8 bg-white/[0.02] text-zinc-500 hover:border-green-500/20 hover:text-green-400"
  );

  return (
    <div className="panel p-3">
      <div className="flex flex-wrap gap-1.5">
        <button type="button" onClick={() => copy("json")} className={btn(copied === "json")}>
          {copied === "json" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied === "json" ? "Copied!" : "Copy JSON"}
        </button>
        <button type="button" onClick={() => copy("link")} className={btn(copied === "link", true)}>
          {copied === "link" ? <Check className="h-3 w-3" /> : <Link2 className="h-3 w-3" />}
          {copied === "link" ? "Copied!" : "Share Link"}
        </button>
        <button type="button" onClick={download} className={btn(false)}>
          <Download className="h-3 w-3" />Download
        </button>
      </div>
    </div>
  );
}
