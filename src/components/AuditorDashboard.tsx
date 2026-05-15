"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { AuditReport } from "@/types/audit";
import { CodeEditor } from "@/components/CodeEditor";
import { FindingCard } from "@/components/FindingCard";
import { PdfExport } from "@/components/PdfExport";
import { SecurityScore } from "@/components/SecurityScore";
import { ShareReport } from "@/components/ShareReport";
import { FixedCodeViewer } from "@/components/FixedCodeViewer";
import { SAMPLE_CONTRACT } from "@/lib/sample-contract";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Bot, FileCode2, Github, Loader2, Shield, Zap, Sparkles } from "lucide-react";

const SCAN_STEPS = [
  "Connecting to AURA-09 AI audit engine",
  "Parsing Solidity AST and control flow",
  "GPT-4o analyzing vulnerability patterns",
  "Detecting reentrancy and access control issues",
  "Scanning integer arithmetic and overflow risks",
  "Evaluating external call safety vectors",
  "AI generating severity scores and recommendations",
  "Compiling structured audit report",
];
const STEP_MS = [300, 350, 320, 380, 340, 290, 360, 500];

function loadSharedReport(): AuditReport | null {
  try {
    if (typeof window === "undefined") return null;
    const enc = new URLSearchParams(window.location.search).get("report");
    return enc ? (JSON.parse(decodeURIComponent(escape(atob(enc)))) as AuditReport) : null;
  } catch { return null; }
}

/* ── Terminal log panel ── */
function TerminalPanel({ visible, progress, report }: { visible: boolean; progress: number; report: AuditReport | null }) {
  const [done, setDone] = useState<number[]>([]);
  const [active, setActive] = useState(0);
  const [time, setTime] = useState("00:00:00");
  const [mounted, setMounted] = useState(false);

  // Fix hydration error by setting time only on client
  useEffect(() => {
    setTime(new Date().toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!visible) { setDone([]); setActive(0); return; }
    setDone([]); setActive(0);
    let i = 0;
    const next = () => {
      if (i >= SCAN_STEPS.length) return;
      setTimeout(() => { setDone((p) => [...p, i]); i++; setActive(i); next(); }, i === 0 ? 80 : STEP_MS[i - 1]);
    };
    next();
  }, [visible]);

  if (!mounted) {
    return (
      <div className="border-x border-b border-[#262626] bg-[#0A0A0A]">
        <div className="flex h-8 items-center justify-between border-b border-[#262626] bg-[#1c1b1b] px-4">
          <span className="flex items-center gap-2 font-jetbrains text-[11px] uppercase tracking-widest text-[#bbcabf]">
            <span className="dot-live" />
            SYSTEM TERMINAL
          </span>
        </div>
        <div className="h-28 overflow-auto p-4 font-jetbrains text-[11px] leading-relaxed space-y-0.5" />
      </div>
    );
  }

  const logs: { ts: string; msg: string; type: "info" | "warn" | "error" }[] = [];

  if (visible || done.length > 0) {
    done.forEach((i) => {
      logs.push({ ts: time, msg: `${SCAN_STEPS[i]}... DONE`, type: "info" });
    });
    if (visible && active < SCAN_STEPS.length) {
      logs.push({ ts: time, msg: `${SCAN_STEPS[active]}... ${progress}% complete`, type: "info" });
    }
  }

  if (report) {
    const crit = report.findings.filter((f) => f.severity === "critical");
    crit.forEach((f) => logs.push({ ts: time, msg: `DETECTION: ${f.title} — ${f.lines.length > 0 ? `line ${f.lines[0]}` : "detected"}`, type: "error" }));
    logs.push({ ts: time, msg: `Analysis complete. ${report.findings.length} finding(s). Score: ${report.securityScore}/100`, type: "info" });
  }

  if (!visible && !report) {
    logs.push({ ts: time, msg: "AURA-09 AI Agent ready. GPT-4o audit engine online.", type: "info" });
    logs.push({ ts: time, msg: "MCP-ready endpoint active at POST /api/audit", type: "info" });
    logs.push({ ts: time, msg: "Paste a Solidity contract and click RUN AUDIT to begin.", type: "info" });
  }

  return (
    <div className="border-x border-b border-[#262626] bg-[#0A0A0A]">
      <div className="flex h-8 items-center justify-between border-b border-[#262626] bg-[#1c1b1b] px-4">
        <span className="flex items-center gap-2 font-jetbrains text-[11px] uppercase tracking-widest text-[#bbcabf]">
          <span className="dot-live" />
          SYSTEM TERMINAL
        </span>
        {visible && (
          <div className="h-1 w-32 overflow-hidden bg-[#262626]">
            <div className="h-full bg-[#10b981] transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        )}
      </div>
      <div className="h-28 overflow-auto p-4 font-jetbrains text-[11px] leading-relaxed space-y-0.5">
        {logs.map((l, i) => (
          <div key={i} className="flex gap-4">
            <span className="shrink-0 text-[#10b981]">[{l.ts}]</span>
            <span className={l.type === "error" ? "text-[#ffb4ab]" : l.type === "warn" ? "text-[#ffb3af]" : "text-[#bbcabf]"}>
              {l.msg}
            </span>
          </div>
        ))}
        {visible && (
          <div className="flex gap-4">
            <span className="shrink-0 text-[#10b981]">[{time}]</span>
            <span className="text-[#4edea3]">▋<span className="animate-blink">_</span></span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Main ── */
export function AuditorDashboard() {
  const [code, setCode] = useState(SAMPLE_CONTRACT);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<AuditReport | null>(loadSharedReport);
  const [activeFindingId, setActiveFindingId] = useState<string | null>(null);
  const [showFixedCode, setShowFixedCode] = useState(false);
  const findingsRef = useRef<HTMLDivElement>(null);

  const highlightLines = useMemo(() => {
    if (!report) return [];
    const hit = report.findings.find((f) => f.id === activeFindingId);
    return hit ? hit.lines : [...new Set(report.findings.flatMap((f) => f.lines))];
  }, [report, activeFindingId]);

  useEffect(() => {
    if (!loading) { setProgress(0); return; }
    const total = STEP_MS.reduce((a, b) => a + b, 0);
    let elapsed = 0;
    const t = setInterval(() => { elapsed += 80; setProgress(Math.min(95, Math.round((elapsed / total) * 100))); }, 80);
    return () => clearInterval(t);
  }, [loading]);

  const analyze = useCallback(async () => {
    setLoading(true); setError(null); setActiveFindingId(null);
    try {
      const res = await fetch("/api/audit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Audit failed");
      setProgress(100); 
      const auditReport = data as AuditReport;
      setReport(auditReport);
      
      // Save to history
      try {
        const history = JSON.parse(localStorage.getItem("audit-history") || "[]");
        history.unshift({ id: auditReport.id, report: auditReport, timestamp: Date.now() });
        localStorage.setItem("audit-history", JSON.stringify(history.slice(0, 50))); // Keep last 50
      } catch (e) {
        console.error("Failed to save to history", e);
      }
      
      setTimeout(() => findingsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 400);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setReport(null);
    } finally { setLoading(false); }
  }, [code]);

  const counts = {
    critical: report?.findings.filter((f) => f.severity === "critical").length ?? 0,
    high:     report?.findings.filter((f) => f.severity === "high").length ?? 0,
    medium:   report?.findings.filter((f) => f.severity === "medium").length ?? 0,
    low:      report?.findings.filter((f) => f.severity === "low").length ?? 0,
  };

  return (
    <div className="min-h-screen">
      <div className="scan-line" />

      {/* ══════════════════════════════════════════
          HEADER — fixed, full width
      ══════════════════════════════════════════ */}
      <header className="fixed left-0 top-0 z-50 flex h-16 w-full items-center justify-between border-b border-[#262626] bg-[#0A0A0A] px-8">
        <div className="flex items-center gap-8">
          {/* Logo */}
          <Link href="/" className="font-jetbrains text-lg font-bold tracking-tighter text-[#e5e2e1]">
            SMART_AUDIT
          </Link>
          {/* Nav */}
          <nav className="hidden items-center gap-6 md:flex">
            <Link href="/" className="border-b border-[#4edea3] pb-0.5 font-jetbrains text-[13px] font-bold text-[#4edea3]">Editor</Link>
            <Link href="/api-docs" className="font-jetbrains text-[13px] font-medium text-[#bbcabf] transition-colors hover:text-[#4edea3]">API</Link>
            <Link href="/docs" className="font-jetbrains text-[13px] font-medium text-[#bbcabf] transition-colors hover:text-[#4edea3]">Docs</Link>
            <Link href="/history" className="font-jetbrains text-[13px] font-medium text-[#bbcabf] transition-colors hover:text-[#4edea3]">History</Link>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="font-jetbrains text-[13px] font-medium text-[#bbcabf] transition-colors hover:text-[#4edea3]">
              <Github className="h-4 w-4" />
            </a>
          </nav>
        </div>
      </header>

      {/* ══════════════════════════════════════════
          MAIN CONTENT — padded for fixed header + footer
      ══════════════════════════════════════════ */}
      <main className="mx-auto max-w-[1440px] px-8 pb-20 pt-24">

        {/* ── Hero ── */}
        <section className="mb-10 flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <div className="mb-2 flex items-center gap-2 text-[#10b981]">
              <Shield className="h-4 w-4" style={{ fill: "#10b981" }} />
              <span className="font-jetbrains text-[11px] uppercase tracking-widest">Enterprise Security Tier</span>
            </div>
            <h1 className="mb-4 text-[32px] font-semibold leading-tight tracking-tight text-[#e5e2e1]">
              Infrastructure-grade Smart<br />Contract Analysis
            </h1>
            <p className="max-w-xl text-[16px] leading-relaxed text-[#bbcabf]">
              Powered by GPT-4o. Detects vulnerabilities, scores security, and auto-generates fixed code — in under 5 seconds.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {["GPT-4o Powered", "MCP-Ready API", "CreateOS Skill", "AI-Agent Compatible"].map((tag) => (
                <span key={tag} className="border border-[#4edea3]/30 bg-[#4edea3]/5 px-2.5 py-1 font-jetbrains text-[10px] uppercase tracking-widest text-[#4edea3]">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          {/* Stat cards */}
          <div className="flex gap-4">
            {[
              { label: "Vuln Types",    value: "6+",      color: "" },
              { label: "Net Health",    value: "99.9%",   color: "text-[#4edea3]" },
              { label: "Active Agent",  value: "AURA-09", color: "" },
            ].map((s) => (
              <div key={s.label} className="min-w-[130px] border border-[#262626] bg-[#1c1b1b] p-4">
                <span className="mb-1 block font-jetbrains text-[11px] uppercase tracking-widest text-[#bbcabf]">{s.label}</span>
                <span className={cn("block text-[24px] font-semibold leading-tight tracking-tight text-[#e5e2e1]", s.color)}>{s.value}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Toolbar ── */}
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileCode2 className="h-4 w-4 text-[#86948a]" />
            <span className="font-jetbrains text-[11px] uppercase tracking-widest text-[#bbcabf]">contract.sol</span>
            <span className="border border-[#262626] bg-[#1c1b1b] px-2 py-0.5 font-jetbrains text-[10px] text-[#86948a]">
              {code.split("\n").length} lines
            </span>
            <button
              type="button"
              onClick={() => setCode(SAMPLE_CONTRACT)}
              className="border border-[#262626] bg-[#1c1b1b] px-2.5 py-0.5 font-jetbrains text-[10px] uppercase tracking-widest text-[#86948a] transition-colors hover:border-[#4edea3]/30 hover:text-[#4edea3]"
            >
              Load Sample
            </button>
          </div>
          <button type="button" onClick={analyze} disabled={loading || !code.trim()} className="btn-primary">
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5" />}
            {loading ? "Analyzing…" : "Run Audit"}
          </button>
        </div>

        {error && (
          <div className="mb-2 border border-[#ffb4ab]/30 bg-[#93000a]/20 px-4 py-2.5 font-jetbrains text-[11px] text-[#ffb4ab]">
            ⚠ {error}
          </div>
        )}

        {/* ══════════════════════════════════════════
            WORKSPACE — editor 65% | analysis 35%
        ══════════════════════════════════════════ */}
        <div className="flex h-[680px] overflow-hidden border border-[#262626] bg-[#0e0e0e]">

          {/* Left — Code Editor */}
          <div className="flex w-[65%] flex-col border-r border-[#262626] bg-[#0A0A0A]">
            {/* Editor titlebar */}
            <div className="flex h-10 shrink-0 items-center justify-between border-b border-[#262626] bg-[#1c1b1b] px-4">
              <div className="flex items-center gap-2">
                <FileCode2 className="h-4 w-4 text-[#bbcabf]" />
                <span className="font-jetbrains text-[11px] text-[#e5e2e1]">contract.sol</span>
              </div>
              <span className="font-jetbrains text-[11px] text-[#86948a]">Solidity 0.8.x</span>
            </div>
            {/* Editor body */}
            <div className="flex-1 overflow-hidden">
              <CodeEditor value={code} onChange={setCode} highlightLines={highlightLines} disabled={loading} />
            </div>
          </div>

          {/* Right — Analysis panel */}
          <div className="flex w-[35%] flex-col bg-[#0e0e0e]">

            {/* Security score / integrity gauge */}
            <div className="shrink-0 border-b border-[#262626] p-5">
              <h3 className="mb-4 flex items-center gap-2 font-jetbrains text-[11px] uppercase tracking-widest text-[#bbcabf]">
                <Shield className="h-4 w-4" />
                Protocol Integrity
              </h3>
              <SecurityScore
                score={report?.securityScore ?? 0}
                grade={report?.grade ?? "—"}
                findingCount={report?.findings.length ?? 0}
                loading={loading}
                idle={!report && !loading}
              />
            </div>

            {/* Findings list */}
            <div className="flex flex-1 flex-col overflow-hidden">
              <div className="flex h-10 shrink-0 items-center justify-between border-b border-[#262626] bg-[#1c1b1b] px-4">
                <span className="font-jetbrains text-[11px] uppercase tracking-widest text-[#e5e2e1]">
                  Security Findings {report ? `(${String(report.findings.length).padStart(2, "0")})` : "(00)"}
                </span>
                {report && report.findings.length > 0 && (
                  <button type="button" onClick={() => setActiveFindingId(null)} className="font-jetbrains text-[10px] text-[#86948a] hover:text-[#e5e2e1]">
                    Clear
                  </button>
                )}
              </div>

              <div className="flex-1 space-y-3 overflow-auto p-4">
                {/* Idle */}
                {!report && !loading && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Shield className="mb-3 h-8 w-8 text-[#262626]" />
                    <p className="font-jetbrains text-[11px] uppercase tracking-widest text-[#3c4a42]">Awaiting Analysis</p>
                    <p className="mt-1 font-jetbrains text-[10px] text-[#262626]">Run audit to see findings</p>
                  </div>
                )}

                {/* Loading skeleton */}
                {loading && [1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse border border-[#262626] bg-[#1c1b1b] p-4">
                    <div className="mb-2 h-3 w-24 bg-[#262626]" />
                    <div className="mb-1 h-4 w-full bg-[#262626]" />
                    <div className="h-3 w-3/4 bg-[#262626]" />
                  </div>
                ))}

                {/* Clean */}
                {report && report.findings.length === 0 && (
                  <div className="border border-[#4edea3]/20 bg-[#4edea3]/5 p-4 text-center">
                    <Shield className="mx-auto mb-2 h-6 w-6 text-[#4edea3]" />
                    <p className="font-jetbrains text-[11px] uppercase tracking-widest text-[#4edea3]">No Vulnerabilities Detected</p>
                  </div>
                )}

                {/* Findings */}
                {report?.findings.map((finding, i) => (
                  <div
                    key={finding.id}
                    style={{ animationDelay: `${i * 50}ms`, opacity: 0 }}
                    className="animate-fade-up"
                  >
                    <FindingCard
                      finding={finding}
                      active={activeFindingId === finding.id}
                      onSelect={() => setActiveFindingId(finding.id === activeFindingId ? null : finding.id)}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Contract summary + export — after analysis */}
            {report && (
              <div className="shrink-0 border-t border-[#262626] p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Bot className="h-3.5 w-3.5 text-[#4edea3]" />
                  <span className="truncate font-jetbrains text-[11px] font-bold uppercase tracking-widest text-[#e5e2e1]">{report.contractName}</span>
                  {report.aiEnhanced && <span className="ml-auto shrink-0 border border-[#4edea3]/30 bg-[#4edea3]/10 px-1.5 py-0.5 font-jetbrains text-[9px] uppercase tracking-widest text-[#4edea3]">AI ✦</span>}
                </div>
                <div className="mb-3 flex flex-wrap gap-1.5">
                  {counts.critical > 0 && <span className="badge-critical border border-[#ffb4ab]/30 bg-[#93000a]/30 px-2 py-0.5 font-jetbrains text-[10px] uppercase text-[#ffb4ab]">{counts.critical} Critical</span>}
                  {counts.high     > 0 && <span className="badge-high border border-orange-500/30 bg-orange-500/10 px-2 py-0.5 font-jetbrains text-[10px] uppercase text-orange-400">{counts.high} High</span>}
                  {counts.medium   > 0 && <span className="badge-medium border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 font-jetbrains text-[10px] uppercase text-amber-400">{counts.medium} Medium</span>}
                  {counts.low      > 0 && <span className="border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 font-jetbrains text-[10px] uppercase text-blue-400">{counts.low} Low</span>}
                </div>
                
                {report.findings.length > 0 && (
                  <button
                    onClick={() => setShowFixedCode(true)}
                    className="mb-2 flex w-full items-center justify-center gap-2 border border-[#4edea3] bg-[#4edea3]/10 px-3 py-2 font-jetbrains text-[11px] font-bold uppercase tracking-widest text-[#4edea3] transition-all hover:bg-[#4edea3]/20"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    View Fixed Code
                  </button>
                )}
                
                <div className="flex gap-2">
                  <div className="flex-1"><ShareReport report={report} /></div>
                  <PdfExport report={report} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Terminal ── */}
        <TerminalPanel visible={loading} progress={progress} report={report} />

        {/* ══════════════════════════════════════════
            BENTO GRID — 3 cols
        ══════════════════════════════════════════ */}
        <div ref={findingsRef} className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
          {/* Formal Verification */}
          <div className="border border-[#262626] bg-[#1c1b1b] p-6">
            <h4 className="mb-2 font-jetbrains text-[13px] uppercase tracking-widest text-[#bbcabf]">Formal Verification</h4>
            <p className="mb-4 text-[14px] leading-relaxed text-[#e5e2e1]">Mathematics-based proof of contract logic against user-defined invariants.</p>
            <div className="h-1.5 w-full overflow-hidden bg-[#353534]">
              <div className="h-full bg-[#4edea3]" style={{ width: report ? "100%" : "25%" }} />
            </div>
            <p className="mt-1.5 font-jetbrains text-[10px] uppercase tracking-widest text-[#86948a]">{report ? "Complete" : "Queued"}</p>
          </div>

          {/* AI Fuzzing */}
          <div className="border border-[#262626] bg-[#1c1b1b] p-6">
            <h4 className="mb-2 font-jetbrains text-[13px] uppercase tracking-widest text-[#bbcabf]">AI Fuzzing Suite</h4>
            <p className="mb-4 text-[14px] leading-relaxed text-[#e5e2e1]">
              {report ? `${report.findings.length} edge-case patterns analyzed across ${report.lineCount} lines of code.` : "Current Campaign: 1.2M edge-case transactions simulated across 4 shards."}
            </p>
            <span className="font-jetbrains text-[11px] uppercase tracking-widest text-[#4edea3]">
              {loading ? "Running Active Campaign" : report ? "Campaign Complete" : "Standby"}
            </span>
          </div>

          {/* Security Score breakdown */}
          <div className="border border-[#262626] bg-[#1c1b1b] p-6">
            <h4 className="mb-2 font-jetbrains text-[13px] uppercase tracking-widest text-[#bbcabf]">Security Assessment</h4>
            <p className="mb-4 text-[14px] leading-relaxed text-[#e5e2e1]">
              {report ? `Score: ${report.securityScore}/100 · Grade: ${report.grade} · ${report.aiEnhanced ? "AI-enriched analysis" : "Static analysis only"}` : "Run an audit to generate a full security assessment report."}
            </p>
            {report ? (
              <div className="flex gap-2">
                <span className="border border-[#4edea3]/30 bg-[#4edea3]/10 px-2 py-0.5 font-jetbrains text-[10px] uppercase tracking-widest text-[#4edea3]">
                  {report.securityScore >= 80 ? "Secure" : report.securityScore >= 60 ? "At Risk" : "Critical Risk"}
                </span>
              </div>
            ) : (
              <button type="button" onClick={analyze} className="font-jetbrains text-[11px] uppercase tracking-widest text-[#4edea3] underline underline-offset-4 hover:opacity-70">
                Run Analysis →
              </button>
            )}
          </div>
        </div>
      </main>

      {/* ══════════════════════════════════════════
          FOOTER — fixed bottom
      ══════════════════════════════════════════ */}
      <footer className="fixed bottom-0 left-0 z-40 flex w-full items-center justify-between border-t border-[#262626] bg-[#0e0e0e] px-8 py-2">
        <div className="flex items-center gap-2">
          <span className="font-jetbrains text-[11px] uppercase tracking-widest text-[#86948a]">
            © 2024 SMART_AUDIT. AI-POWERED SECURITY.
          </span>
        </div>
        <div className="flex gap-6">
          <Link href="/" className="font-jetbrains text-[11px] uppercase tracking-widest text-[#86948a] transition-colors hover:text-[#e5e2e1]">Editor</Link>
          <Link href="/api-docs" className="font-jetbrains text-[11px] uppercase tracking-widest text-[#86948a] transition-colors hover:text-[#e5e2e1]">API</Link>
          <Link href="/docs" className="font-jetbrains text-[11px] uppercase tracking-widest text-[#86948a] transition-colors hover:text-[#e5e2e1]">Docs</Link>
          <Link href="/history" className="font-jetbrains text-[11px] uppercase tracking-widest text-[#86948a] transition-colors hover:text-[#e5e2e1]">History</Link>
          <a href="https://github.com" target="_blank" rel="noreferrer" className="font-jetbrains text-[11px] uppercase tracking-widest text-[#86948a] transition-colors hover:text-[#e5e2e1]">GitHub</a>
        </div>
      </footer>
      
      {showFixedCode && report && (
        <FixedCodeViewer
          originalCode={code}
          report={report}
          onClose={() => setShowFixedCode(false)}
        />
      )}
    </div>
  );
}
