"use client";

import { Bot, FileCode2, Github, Shield, Zap } from "lucide-react";
import Link from "next/link";

export default function DocsPage() {
  return (
    <div className="min-h-screen">
      <div className="scan-line" />

      {/* Header */}
      <header className="fixed left-0 top-0 z-50 flex h-16 w-full items-center justify-between border-b border-[#262626] bg-[#0A0A0A] px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="font-jetbrains text-lg font-bold tracking-tighter text-[#e5e2e1]">
            SMART_AUDIT
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <Link href="/" className="font-jetbrains text-[13px] font-medium text-[#bbcabf] transition-colors hover:text-[#4edea3]">
              Editor
            </Link>
            <Link href="/api-docs" className="font-jetbrains text-[13px] font-medium text-[#bbcabf] transition-colors hover:text-[#4edea3]">
              API
            </Link>
            <Link href="/docs" className="border-b border-[#4edea3] pb-0.5 font-jetbrains text-[13px] font-bold text-[#4edea3]">
              Docs
            </Link>
            <Link href="/history" className="font-jetbrains text-[13px] font-medium text-[#bbcabf] transition-colors hover:text-[#4edea3]">
              History
            </Link>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="font-jetbrains text-[13px] font-medium text-[#bbcabf] transition-colors hover:text-[#4edea3]">
              <Github className="h-4 w-4" />
            </a>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-[1440px] px-8 pb-20 pt-24">
        {/* Hero */}
        <section className="mb-10">
          <div className="mb-2 flex items-center gap-2 text-[#10b981]">
            <FileCode2 className="h-4 w-4" />
            <span className="font-jetbrains text-[11px] uppercase tracking-widest">Documentation</span>
          </div>
          <h1 className="mb-4 text-[32px] font-semibold leading-tight tracking-tight text-[#e5e2e1]">
            How It Works
          </h1>
          <p className="max-w-2xl text-[15px] leading-relaxed text-[#bbcabf]">
            SMART_AUDIT provides infrastructure-grade smart contract analysis with AI-powered vulnerability detection. Learn how to use it effectively.
          </p>
        </section>

        {/* Quickstart & Detection Engine */}
        <div className="grid gap-5 md:grid-cols-2">
          {/* Quickstart */}
          <div className="border border-[#262626] bg-[#0e0e0e]">
            <div className="border-b border-[#262626] bg-[#1c1b1b] px-4 py-3">
              <span className="font-jetbrains text-[11px] uppercase tracking-widest text-[#e5e2e1]">Quickstart</span>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center border border-[#4edea3]/30 bg-[#4edea3]/10 font-jetbrains text-[11px] font-bold text-[#4edea3]">1</span>
                  <span className="font-jetbrains text-[12px] font-bold uppercase tracking-widest text-[#e5e2e1]">Paste Contract</span>
                </div>
                <p className="text-[13px] leading-relaxed text-[#bbcabf]">Copy your Solidity code into the editor or import from wallet.</p>
              </div>
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center border border-[#4edea3]/30 bg-[#4edea3]/10 font-jetbrains text-[11px] font-bold text-[#4edea3]">2</span>
                  <span className="font-jetbrains text-[12px] font-bold uppercase tracking-widest text-[#e5e2e1]">Run Audit</span>
                </div>
                <p className="text-[13px] leading-relaxed text-[#bbcabf]">Click "Run Audit" to analyze with AURA-09 agent.</p>
              </div>
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center border border-[#4edea3]/30 bg-[#4edea3]/10 font-jetbrains text-[11px] font-bold text-[#4edea3]">3</span>
                  <span className="font-jetbrains text-[12px] font-bold uppercase tracking-widest text-[#e5e2e1]">Review Findings</span>
                </div>
                <p className="text-[13px] leading-relaxed text-[#bbcabf]">Get severity-ranked vulnerabilities with line references and fixes.</p>
              </div>
            </div>
          </div>

          {/* Detection Engine */}
          <div className="border border-[#262626] bg-[#0e0e0e]">
            <div className="border-b border-[#262626] bg-[#1c1b1b] px-4 py-3">
              <span className="font-jetbrains text-[11px] uppercase tracking-widest text-[#e5e2e1]">Detection Engine</span>
            </div>
            <div className="p-5">
              <p className="mb-4 text-[13px] leading-relaxed text-[#bbcabf]">
                SMART_AUDIT uses static analysis combined with optional AI enrichment to detect:
              </p>
              <ul className="space-y-2">
                {[
                  "Reentrancy vulnerabilities",
                  "tx.origin authentication issues",
                  "Unsafe external calls",
                  "Access control gaps",
                  "Integer overflow (pre-0.8)",
                  "Unchecked low-level calls",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#4edea3]" />
                    <span className="text-[13px] text-[#bbcabf]">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* AI Enhancement */}
          <div className="border border-[#262626] bg-[#0e0e0e]">
            <div className="border-b border-[#262626] bg-[#1c1b1b] px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="font-jetbrains text-[11px] uppercase tracking-widest text-[#e5e2e1]">AI Enhancement</span>
                <span className="rounded border border-[#4edea3]/30 bg-[#4edea3]/10 px-1.5 py-0.5 font-jetbrains text-[9px] uppercase tracking-widest text-[#4edea3]">Optional</span>
              </div>
            </div>
            <div className="p-5">
              <p className="mb-3 text-[13px] leading-relaxed text-[#bbcabf]">
                When OpenAI API key is configured, findings are enriched with:
              </p>
              <div className="space-y-2">
                {["Context-aware explanations", "Detailed remediation steps", "Code-specific recommendations"].map((item) => (
                  <div key={item} className="flex items-center gap-2 border border-[#262626] bg-[#0A0A0A] px-3 py-2">
                    <Bot className="h-3.5 w-3.5 text-[#4edea3]" />
                    <span className="text-[12px] text-[#bbcabf]">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Integration */}
          <div className="border border-[#262626] bg-[#0e0e0e]">
            <div className="border-b border-[#262626] bg-[#1c1b1b] px-4 py-3">
              <span className="font-jetbrains text-[11px] uppercase tracking-widest text-[#e5e2e1]">Integration</span>
            </div>
            <div className="p-5">
              <p className="mb-4 text-[13px] leading-relaxed text-[#bbcabf]">
                SMART_AUDIT is designed for seamless integration:
              </p>
              <div className="space-y-3">
                <div>
                  <h5 className="mb-1 font-jetbrains text-[11px] font-bold uppercase tracking-widest text-[#4edea3]">CreateOS Skill</h5>
                  <p className="text-[12px] text-[#86948a]">Deploy as a skill in the CreateOS ecosystem</p>
                </div>
                <div>
                  <h5 className="mb-1 font-jetbrains text-[11px] font-bold uppercase tracking-widest text-[#4edea3]">MCP Protocol</h5>
                  <p className="text-[12px] text-[#86948a]">Model Context Protocol ready for AI agents</p>
                </div>
                <div>
                  <h5 className="mb-1 font-jetbrains text-[11px] font-bold uppercase tracking-widest text-[#4edea3]">REST API</h5>
                  <p className="text-[12px] text-[#86948a]">Standard JSON endpoint for any client</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-10">
          <h2 className="mb-4 text-[24px] font-semibold leading-tight tracking-tight text-[#e5e2e1]">Key Features</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                icon: Shield,
                title: "Security Score",
                desc: "Get a comprehensive security score (0-100) with letter grade based on detected vulnerabilities.",
              },
              {
                icon: FileCode2,
                title: "Line Highlighting",
                desc: "Vulnerable code lines are highlighted directly in the editor for easy identification.",
              },
              {
                icon: Bot,
                title: "AI-Powered",
                desc: "Optional AI enrichment provides context-aware explanations and detailed recommendations.",
              },
              {
                icon: Zap,
                title: "Fast Analysis",
                desc: "Static analysis engine provides results in under 2 seconds for most contracts.",
              },
              {
                icon: Shield,
                title: "Export Reports",
                desc: "Download PDF reports or share via URL for team collaboration and auditing.",
              },
              {
                icon: Bot,
                title: "MCP Compatible",
                desc: "Model Context Protocol ready for integration with AI agents and automation tools.",
              },
            ].map((feature) => (
              <div key={feature.title} className="border border-[#262626] bg-[#1c1b1b] p-5">
                <feature.icon className="mb-3 h-6 w-6 text-[#4edea3]" />
                <h3 className="mb-2 font-jetbrains text-[13px] font-bold uppercase tracking-widest text-[#e5e2e1]">
                  {feature.title}
                </h3>
                <p className="text-[13px] leading-relaxed text-[#bbcabf]">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Environment Setup */}
        <div className="mt-10 border border-[#262626] bg-[#0e0e0e]">
          <div className="border-b border-[#262626] bg-[#1c1b1b] px-4 py-3">
            <span className="font-jetbrains text-[11px] uppercase tracking-widest text-[#e5e2e1]">Environment Setup</span>
          </div>
          <div className="p-5">
            <p className="mb-4 text-[13px] leading-relaxed text-[#bbcabf]">
              To enable AI-enhanced findings, configure your OpenAI API key:
            </p>
            <pre className="overflow-x-auto border border-[#262626] bg-[#0A0A0A] p-3 font-jetbrains text-[11px] leading-relaxed text-[#bbcabf]">{`# .env.local
OPENAI_API_KEY=sk-...`}</pre>
            <p className="mt-3 text-[12px] text-[#86948a]">
              Without an API key, SMART_AUDIT will still perform static analysis and detect vulnerabilities, but findings won't include AI-generated explanations.
            </p>
          </div>
        </div>

        {/* Get Started */}
        <div className="mt-10 border border-[#4edea3]/30 bg-[#4edea3]/5 p-6">
          <h3 className="mb-2 font-jetbrains text-[13px] font-bold uppercase tracking-widest text-[#4edea3]">
            Ready to Start?
          </h3>
          <p className="mb-4 text-[14px] leading-relaxed text-[#bbcabf]">
            Head to the Editor to analyze your first smart contract, or check out the API documentation for programmatic access.
          </p>
          <div className="flex gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 border border-[#4edea3] bg-[#10b981] px-4 py-2 font-jetbrains text-[11px] font-bold uppercase tracking-widest text-[#003824] transition-opacity hover:opacity-85"
            >
              <Zap className="h-3.5 w-3.5" />
              Go to Editor
            </Link>
            <Link
              href="/api-docs"
              className="inline-flex items-center gap-2 border border-[#262626] bg-[#1c1b1b] px-4 py-2 font-jetbrains text-[11px] font-bold uppercase tracking-widest text-[#bbcabf] transition-colors hover:border-[#4edea3]/30 hover:text-[#4edea3]"
            >
              View API Docs
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 z-40 flex w-full items-center justify-between border-t border-[#262626] bg-[#0e0e0e] px-8 py-2">
        <div className="flex items-center gap-2">
          <span className="font-jetbrains text-[11px] uppercase tracking-widest text-[#86948a]">
            © 2024 SMART_AUDIT. AI-POWERED SECURITY.
          </span>
        </div>
        <div className="flex gap-6">
          <Link href="/" className="font-jetbrains text-[11px] uppercase tracking-widest text-[#86948a] transition-colors hover:text-[#e5e2e1]">
            Editor
          </Link>
          <Link href="/api-docs" className="font-jetbrains text-[11px] uppercase tracking-widest text-[#86948a] transition-colors hover:text-[#e5e2e1]">
            API
          </Link>
          <Link href="/docs" className="font-jetbrains text-[11px] uppercase tracking-widest text-[#86948a] transition-colors hover:text-[#e5e2e1]">
            Docs
          </Link>
          <Link href="/history" className="font-jetbrains text-[11px] uppercase tracking-widest text-[#86948a] transition-colors hover:text-[#e5e2e1]">
            History
          </Link>
          <a href="https://github.com" target="_blank" rel="noreferrer" className="font-jetbrains text-[11px] uppercase tracking-widest text-[#86948a] transition-colors hover:text-[#e5e2e1]">
            GitHub
          </a>
        </div>
      </footer>
    </div>
  );
}
