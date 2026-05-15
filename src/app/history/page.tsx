"use client";

import { useEffect, useState } from "react";
import { FileCode2, Github, Shield, Trash2, Download, TrendingUp, TrendingDown } from "lucide-react";
import Link from "next/link";
import type { AuditReport } from "@/types/audit";

interface AuditHistory {
  id: string;
  report: AuditReport;
  timestamp: number;
}

export default function HistoryPage() {
  const [history, setHistory] = useState<AuditHistory[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("audit-history");
    if (stored) {
      try {
        setHistory(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }
  }, []);

  const clearHistory = () => {
    if (confirm("Are you sure you want to clear all audit history?")) {
      localStorage.removeItem("audit-history");
      setHistory([]);
    }
  };

  const deleteAudit = (id: string) => {
    const updated = history.filter((h) => h.id !== id);
    setHistory(updated);
    localStorage.setItem("audit-history", JSON.stringify(updated));
  };

  const exportHistory = () => {
    const dataStr = JSON.stringify(history, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `smart-audit-history-${Date.now()}.json`;
    link.click();
  };

  const stats = {
    total: history.length,
    avgScore: history.length > 0 ? Math.round(history.reduce((sum, h) => sum + h.report.securityScore, 0) / history.length) : 0,
    totalFindings: history.reduce((sum, h) => sum + h.report.findings.length, 0),
    criticalCount: history.reduce((sum, h) => sum + h.report.findings.filter(f => f.severity === "critical").length, 0),
  };

  if (!mounted) {
    return (
      <div className="min-h-screen">
        <div className="scan-line" />
        <header className="fixed left-0 top-0 z-50 flex h-16 w-full items-center justify-between border-b border-[#262626] bg-[#0A0A0A] px-8">
          <div className="flex items-center gap-8">
            <Link href="/" className="font-jetbrains text-lg font-bold tracking-tighter text-[#e5e2e1]">
              SMART_AUDIT
            </Link>
          </div>
        </header>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="scan-line" />

      <header className="fixed left-0 top-0 z-50 flex h-16 w-full items-center justify-between border-b border-[#262626] bg-[#0A0A0A] px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="font-jetbrains text-lg font-bold tracking-tighter text-[#e5e2e1]">
            SMART_AUDIT
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <Link href="/" className="font-jetbrains text-[13px] font-medium text-[#bbcabf] transition-colors hover:text-[#4edea3]">Editor</Link>
            <Link href="/api-docs" className="font-jetbrains text-[13px] font-medium text-[#bbcabf] transition-colors hover:text-[#4edea3]">API</Link>
            <Link href="/docs" className="font-jetbrains text-[13px] font-medium text-[#bbcabf] transition-colors hover:text-[#4edea3]">Docs</Link>
            <Link href="/history" className="border-b border-[#4edea3] pb-0.5 font-jetbrains text-[13px] font-bold text-[#4edea3]">History</Link>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="font-jetbrains text-[13px] font-medium text-[#bbcabf] transition-colors hover:text-[#4edea3]">
              <Github className="h-4 w-4" />
            </a>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-[1440px] px-8 pb-20 pt-24">
        <section className="mb-10">
          <div className="mb-2 flex items-center gap-2 text-[#10b981]">
            <FileCode2 className="h-4 w-4" />
            <span className="font-jetbrains text-[11px] uppercase tracking-widest">Audit History</span>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <h1 className="mb-4 text-[32px] font-semibold leading-tight tracking-tight text-[#e5e2e1]">
                Your Audit History
              </h1>
              <p className="max-w-2xl text-[15px] leading-relaxed text-[#bbcabf]">
                Track all your smart contract audits over time. View trends, compare results, and monitor security improvements.
              </p>
            </div>
            {history.length > 0 && (
              <div className="flex gap-2">
                <button onClick={exportHistory} className="flex items-center gap-2 border border-[#262626] bg-[#1c1b1b] px-4 py-2 font-jetbrains text-[11px] font-bold uppercase tracking-widest text-[#bbcabf] transition-colors hover:border-[#4edea3]/30 hover:text-[#4edea3]">
                  <Download className="h-3.5 w-3.5" />
                  Export
                </button>
                <button onClick={clearHistory} className="flex items-center gap-2 border border-[#ffb4ab]/30 bg-[#93000a]/20 px-4 py-2 font-jetbrains text-[11px] font-bold uppercase tracking-widest text-[#ffb4ab] transition-opacity hover:opacity-70">
                  <Trash2 className="h-3.5 w-3.5" />
                  Clear All
                </button>
              </div>
            )}
          </div>
        </section>

        {history.length > 0 && (
          <div className="mb-10 grid gap-4 md:grid-cols-4">
            <div className="border border-[#262626] bg-[#1c1b1b] p-5">
              <div className="mb-2 flex items-center gap-2">
                <FileCode2 className="h-4 w-4 text-[#4edea3]" />
                <span className="font-jetbrains text-[11px] uppercase tracking-widest text-[#bbcabf]">Total Audits</span>
              </div>
              <div className="text-[32px] font-bold text-[#e5e2e1]">{stats.total}</div>
            </div>

            <div className="border border-[#262626] bg-[#1c1b1b] p-5">
              <div className="mb-2 flex items-center gap-2">
                <Shield className="h-4 w-4 text-[#4edea3]" />
                <span className="font-jetbrains text-[11px] uppercase tracking-widest text-[#bbcabf]">Avg Score</span>
              </div>
              <div className="flex items-end gap-2">
                <div className="text-[32px] font-bold text-[#e5e2e1]">{stats.avgScore}</div>
                <div className="mb-1 text-[14px] text-[#86948a]">/100</div>
              </div>
            </div>

            <div className="border border-[#262626] bg-[#1c1b1b] p-5">
              <div className="mb-2 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-[#4edea3]" />
                <span className="font-jetbrains text-[11px] uppercase tracking-widest text-[#bbcabf]">Total Findings</span>
              </div>
              <div className="text-[32px] font-bold text-[#e5e2e1]">{stats.totalFindings}</div>
            </div>

            <div className="border border-[#262626] bg-[#1c1b1b] p-5">
              <div className="mb-2 flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-[#ffb4ab]" />
                <span className="font-jetbrains text-[11px] uppercase tracking-widest text-[#bbcabf]">Critical Issues</span>
              </div>
              <div className="text-[32px] font-bold text-[#ffb4ab]">{stats.criticalCount}</div>
            </div>
          </div>
        )}

        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center border border-[#262626] bg-[#0e0e0e] py-20">
            <FileCode2 className="mb-4 h-12 w-12 text-[#262626]" />
            <h3 className="mb-2 font-jetbrains text-[13px] font-bold uppercase tracking-widest text-[#bbcabf]">No Audit History</h3>
            <p className="mb-6 text-[13px] text-[#86948a]">Run your first audit to start tracking history</p>
            <Link href="/" className="inline-flex items-center gap-2 border border-[#4edea3] bg-[#10b981] px-4 py-2 font-jetbrains text-[11px] font-bold uppercase tracking-widest text-[#003824] transition-opacity hover:opacity-85">
              Go to Editor
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((item) => {
              const date = new Date(item.timestamp);
              const criticalCount = item.report.findings.filter(f => f.severity === "critical").length;
              const highCount = item.report.findings.filter(f => f.severity === "high").length;

              return (
                <div key={item.id} className="border border-[#262626] bg-[#0e0e0e] transition-colors hover:border-[#4edea3]/30">
                  <div className="flex items-center justify-between border-b border-[#262626] bg-[#1c1b1b] px-5 py-3">
                    <div className="flex items-center gap-4">
                      <FileCode2 className="h-4 w-4 text-[#4edea3]" />
                      <div>
                        <h3 className="font-jetbrains text-[13px] font-bold text-[#e5e2e1]">{item.report.contractName}</h3>
                        <p className="font-jetbrains text-[10px] text-[#86948a]">
                          {date.toLocaleDateString()} at {date.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <button onClick={() => deleteAudit(item.id)} className="text-[#86948a] transition-colors hover:text-[#ffb4ab]">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="p-5">
                    <div className="mb-4 flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="font-jetbrains text-[11px] uppercase tracking-widest text-[#86948a]">Score:</span>
                        <span className="font-jetbrains text-[18px] font-bold text-[#e5e2e1]">{item.report.securityScore}/100</span>
                        <span className="rounded border border-[#4edea3]/30 bg-[#4edea3]/10 px-2 py-0.5 font-jetbrains text-[10px] font-bold text-[#4edea3]">
                          {item.report.grade}
                        </span>
                      </div>
                      <div className="h-4 w-px bg-[#262626]" />
                      <div className="flex items-center gap-2">
                        <span className="font-jetbrains text-[11px] uppercase tracking-widest text-[#86948a]">Findings:</span>
                        <span className="font-jetbrains text-[14px] text-[#e5e2e1]">{item.report.findings.length}</span>
                      </div>
                      {item.report.aiEnhanced && (
                        <>
                          <div className="h-4 w-px bg-[#262626]" />
                          <span className="rounded border border-[#4edea3]/30 bg-[#4edea3]/10 px-2 py-0.5 font-jetbrains text-[9px] uppercase tracking-widest text-[#4edea3]">AI ✦</span>
                        </>
                      )}
                    </div>

                    {item.report.findings.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {criticalCount > 0 && (
                          <span className="border border-[#ffb4ab]/30 bg-[#93000a]/30 px-2 py-1 font-jetbrains text-[10px] uppercase text-[#ffb4ab]">
                            {criticalCount} Critical
                          </span>
                        )}
                        {highCount > 0 && (
                          <span className="border border-orange-500/30 bg-orange-500/10 px-2 py-1 font-jetbrains text-[10px] uppercase text-orange-400">
                            {highCount} High
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <footer className="fixed bottom-0 left-0 z-40 flex w-full items-center justify-between border-t border-[#262626] bg-[#0e0e0e] px-8 py-2">
        <div className="flex items-center gap-2">
          <span className="font-jetbrains text-[11px] uppercase tracking-widest text-[#86948a]">© 2024 SMART_AUDIT. AI-POWERED SECURITY.</span>
        </div>
        <div className="flex gap-6">
          <Link href="/" className="font-jetbrains text-[11px] uppercase tracking-widest text-[#86948a] transition-colors hover:text-[#e5e2e1]">Editor</Link>
          <Link href="/api-docs" className="font-jetbrains text-[11px] uppercase tracking-widest text-[#86948a] transition-colors hover:text-[#e5e2e1]">API</Link>
          <Link href="/docs" className="font-jetbrains text-[11px] uppercase tracking-widest text-[#86948a] transition-colors hover:text-[#e5e2e1]">Docs</Link>
          <Link href="/history" className="font-jetbrains text-[11px] uppercase tracking-widest text-[#86948a] transition-colors hover:text-[#e5e2e1]">History</Link>
          <a href="https://github.com" target="_blank" rel="noreferrer" className="font-jetbrains text-[11px] uppercase tracking-widest text-[#86948a] transition-colors hover:text-[#e5e2e1]">GitHub</a>
        </div>
      </footer>
    </div>
  );
}
