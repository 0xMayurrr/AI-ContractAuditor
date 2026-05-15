"use client";

import { useState } from "react";
import { Check, Copy, Download, X } from "lucide-react";
import type { AuditReport } from "@/types/audit";
import { generateFullFixedContract } from "@/lib/autofix";

interface FixedCodeViewerProps {
  originalCode: string;
  report: AuditReport;
  onClose: () => void;
}

export function FixedCodeViewer({ originalCode, report, onClose }: FixedCodeViewerProps) {
  const [copied, setCopied] = useState(false);
  const [view, setView] = useState<"split" | "fixed">("split");

  const fixedCode = generateFullFixedContract(originalCode, report.findings);

  const handleCopy = () => {
    navigator.clipboard.writeText(fixedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([fixedCode], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${report.contractName}_fixed.sol`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4">
      <div className="flex h-[90vh] w-full max-w-[1400px] flex-col border border-[#262626] bg-[#0A0A0A] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#262626] bg-[#1c1b1b] px-6 py-4">
          <div>
            <h2 className="mb-1 font-jetbrains text-[16px] font-bold text-[#e5e2e1]">
              ✅ Auto-Fixed Contract
            </h2>
            <p className="font-jetbrains text-[11px] text-[#86948a]">
              {report.findings.length} vulnerabilities fixed • Review before deployment
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* View Toggle */}
            <div className="flex border border-[#262626] bg-[#0e0e0e]">
              <button
                onClick={() => setView("split")}
                className={`px-3 py-1.5 font-jetbrains text-[10px] uppercase tracking-widest transition-colors ${
                  view === "split"
                    ? "bg-[#4edea3] text-[#003824]"
                    : "text-[#86948a] hover:text-[#e5e2e1]"
                }`}
              >
                Split View
              </button>
              <button
                onClick={() => setView("fixed")}
                className={`px-3 py-1.5 font-jetbrains text-[10px] uppercase tracking-widest transition-colors ${
                  view === "fixed"
                    ? "bg-[#4edea3] text-[#003824]"
                    : "text-[#86948a] hover:text-[#e5e2e1]"
                }`}
              >
                Fixed Only
              </button>
            </div>

            <button
              onClick={handleCopy}
              className="flex items-center gap-2 border border-[#262626] bg-[#0e0e0e] px-3 py-1.5 font-jetbrains text-[10px] uppercase tracking-widest text-[#bbcabf] transition-colors hover:border-[#4edea3]/30 hover:text-[#4edea3]"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied!" : "Copy"}
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-2 border border-[#4edea3] bg-[#10b981] px-3 py-1.5 font-jetbrains text-[10px] uppercase tracking-widest text-[#003824] transition-opacity hover:opacity-85"
            >
              <Download className="h-3.5 w-3.5" />
              Download
            </button>

            <button
              onClick={onClose}
              className="ml-2 text-[#86948a] transition-colors hover:text-[#e5e2e1]"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {view === "split" ? (
            <>
              {/* Original Code */}
              <div className="flex w-1/2 flex-col border-r border-[#262626]">
                <div className="border-b border-[#262626] bg-[#1c1b1b] px-4 py-2">
                  <span className="font-jetbrains text-[11px] uppercase tracking-widest text-[#ffb4ab]">
                    ❌ Original (Vulnerable)
                  </span>
                </div>
                <div className="flex-1 overflow-auto bg-[#0e0e0e] p-4">
                  <pre className="font-jetbrains text-[11px] leading-relaxed text-[#bbcabf]">
                    {originalCode}
                  </pre>
                </div>
              </div>

              {/* Fixed Code */}
              <div className="flex w-1/2 flex-col">
                <div className="border-b border-[#262626] bg-[#1c1b1b] px-4 py-2">
                  <span className="font-jetbrains text-[11px] uppercase tracking-widest text-[#4edea3]">
                    ✅ Fixed (Secure)
                  </span>
                </div>
                <div className="flex-1 overflow-auto bg-[#0e0e0e] p-4">
                  <pre className="font-jetbrains text-[11px] leading-relaxed text-[#bbcabf]">
                    {fixedCode}
                  </pre>
                </div>
              </div>
            </>
          ) : (
            /* Fixed Code Only */
            <div className="flex w-full flex-col">
              <div className="border-b border-[#262626] bg-[#1c1b1b] px-4 py-2">
                <span className="font-jetbrains text-[11px] uppercase tracking-widest text-[#4edea3]">
                  ✅ Fixed Contract
                </span>
              </div>
              <div className="flex-1 overflow-auto bg-[#0e0e0e] p-4">
                <pre className="font-jetbrains text-[11px] leading-relaxed text-[#bbcabf]">
                  {fixedCode}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-[#262626] bg-[#1c1b1b] px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-[#4edea3]" />
                <span className="font-jetbrains text-[10px] text-[#86948a]">
                  {report.findings.length} fixes applied
                </span>
              </div>
              <div className="h-3 w-px bg-[#262626]" />
              <span className="font-jetbrains text-[10px] text-[#86948a]">
                Security Score: {report.securityScore}/100 → Estimated: 95+/100
              </span>
            </div>
            <span className="font-jetbrains text-[10px] text-[#86948a]">
              ⚠️ Always review and test fixed code before deployment
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
