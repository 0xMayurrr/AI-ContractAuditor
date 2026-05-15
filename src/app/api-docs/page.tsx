"use client";

import { useState } from "react";
import { Bot, Copy, Github, Shield, Wallet, Zap } from "lucide-react";
import Link from "next/link";

export default function ApiDocsPage() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const curlCommand = `curl -X POST ${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/api/audit \\
  -H "Content-Type: application/json" \\
  -d '{"code": "pragma solidity ^0.8.0; contract Example { }"}'`;
    
    navigator.clipboard.writeText(curlCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
            <Link href="/api-docs" className="border-b border-[#4edea3] pb-0.5 font-jetbrains text-[13px] font-bold text-[#4edea3]">
              API
            </Link>
            <Link href="/docs" className="font-jetbrains text-[13px] font-medium text-[#bbcabf] transition-colors hover:text-[#4edea3]">
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
            <Zap className="h-4 w-4" />
            <span className="font-jetbrains text-[11px] uppercase tracking-widest">MCP-Ready Endpoint</span>
          </div>
          <h1 className="mb-4 text-[32px] font-semibold leading-tight tracking-tight text-[#e5e2e1]">
            Developer API
          </h1>
          <p className="max-w-2xl text-[15px] leading-relaxed text-[#bbcabf]">
            Programmatic access for developers, AI agents, and CreateOS Skills. Infrastructure-grade audit endpoint with JSON response.
          </p>
        </section>

        {/* API Documentation */}
        <div className="grid gap-5 md:grid-cols-2">
          {/* Request */}
          <div className="border border-[#262626] bg-[#0e0e0e]">
            <div className="flex items-center justify-between border-b border-[#262626] bg-[#1c1b1b] px-4 py-3">
              <span className="font-jetbrains text-[11px] uppercase tracking-widest text-[#e5e2e1]">Request</span>
              <button
                type="button"
                onClick={handleCopy}
                className="font-jetbrains text-[10px] uppercase tracking-widest text-[#86948a] transition-colors hover:text-[#4edea3]"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <div className="p-4">
              <div className="mb-3">
                <span className="font-jetbrains text-[11px] uppercase tracking-widest text-[#86948a]">Endpoint</span>
                <div className="mt-1 flex items-center gap-2 border border-[#262626] bg-[#0A0A0A] px-3 py-2">
                  <span className="rounded bg-[#10b981] px-1.5 py-0.5 font-jetbrains text-[10px] font-bold text-[#003824]">POST</span>
                  <code className="font-jetbrains text-[11px] text-[#4edea3]">/api/audit</code>
                </div>
              </div>
              <div>
                <span className="font-jetbrains text-[11px] uppercase tracking-widest text-[#86948a]">Body</span>
                <pre className="mt-1 overflow-x-auto border border-[#262626] bg-[#0A0A0A] p-3 font-jetbrains text-[11px] leading-relaxed text-[#bbcabf]">{`{
  "code": "pragma solidity ^0.8.0;\\n\\ncontract Example {\\n  // Your contract code\\n}"
}`}</pre>
              </div>
            </div>
          </div>

          {/* Response */}
          <div className="border border-[#262626] bg-[#0e0e0e]">
            <div className="flex items-center justify-between border-b border-[#262626] bg-[#1c1b1b] px-4 py-3">
              <span className="font-jetbrains text-[11px] uppercase tracking-widest text-[#e5e2e1]">Response</span>
              <span className="rounded bg-[#4edea3]/10 px-1.5 py-0.5 font-jetbrains text-[10px] uppercase tracking-widest text-[#4edea3]">200 OK</span>
            </div>
            <div className="p-4">
              <pre className="overflow-x-auto border border-[#262626] bg-[#0A0A0A] p-3 font-jetbrains text-[11px] leading-relaxed text-[#bbcabf]">{`{
  "securityScore": 72,
  "grade": "B",
  "contractName": "Example",
  "findings": [
    {
      "severity": "high",
      "category": "reentrancy",
      "title": "Reentrancy vulnerability",
      "lines": [18],
      "recommendation": "Update state before external call"
    }
  ],
  "aiEnhanced": true
}`}</pre>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {[
            { icon: Bot, label: "AI-Agent Compatible", desc: "Structured JSON for autonomous agents" },
            { icon: Zap, label: "MCP-Ready", desc: "Model Context Protocol integration" },
            { icon: Shield, label: "CreateOS Skill", desc: "Deploy as a CreateOS ecosystem tool" },
          ].map((f) => (
            <div key={f.label} className="border border-[#262626] bg-[#1c1b1b] p-4">
              <f.icon className="mb-2 h-5 w-5 text-[#4edea3]" />
              <h4 className="mb-1 font-jetbrains text-[12px] font-bold uppercase tracking-widest text-[#e5e2e1]">{f.label}</h4>
              <p className="text-[13px] leading-relaxed text-[#bbcabf]">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* cURL Example */}
        <div className="mt-10 border border-[#262626] bg-[#0e0e0e]">
          <div className="flex items-center justify-between border-b border-[#262626] bg-[#1c1b1b] px-4 py-3">
            <span className="font-jetbrains text-[11px] uppercase tracking-widest text-[#e5e2e1]">cURL Example</span>
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-2 font-jetbrains text-[10px] uppercase tracking-widest text-[#86948a] transition-colors hover:text-[#4edea3]"
            >
              <Copy className="h-3 w-3" />
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <div className="p-4">
            <pre className="overflow-x-auto border border-[#262626] bg-[#0A0A0A] p-3 font-jetbrains text-[11px] leading-relaxed text-[#bbcabf]">{`curl -X POST ${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/api/audit \\
  -H "Content-Type: application/json" \\
  -d '{
    "code": "pragma solidity ^0.8.0;\\n\\ncontract Example {\\n  function transfer() public {\\n    // Your code\\n  }\\n}"
  }'`}</pre>
          </div>
        </div>

        {/* Response Fields */}
        <div className="mt-10">
          <h2 className="mb-4 text-[24px] font-semibold leading-tight tracking-tight text-[#e5e2e1]">Response Fields</h2>
          <div className="border border-[#262626] bg-[#0e0e0e]">
            <div className="divide-y divide-[#262626]">
              {[
                { field: "id", type: "string", desc: "Unique audit report identifier" },
                { field: "contractName", type: "string", desc: "Extracted contract name" },
                { field: "securityScore", type: "number", desc: "Security score (0-100)" },
                { field: "grade", type: "string", desc: "Letter grade (A, B, C, D, F)" },
                { field: "findings", type: "array", desc: "Array of vulnerability findings" },
                { field: "aiEnhanced", type: "boolean", desc: "Whether AI enrichment was applied" },
                { field: "lineCount", type: "number", desc: "Total lines of code analyzed" },
              ].map((item) => (
                <div key={item.field} className="flex items-start gap-4 p-4">
                  <code className="shrink-0 font-jetbrains text-[11px] text-[#4edea3]">{item.field}</code>
                  <span className="shrink-0 rounded border border-[#262626] bg-[#0A0A0A] px-2 py-0.5 font-jetbrains text-[10px] text-[#86948a]">
                    {item.type}
                  </span>
                  <p className="text-[13px] text-[#bbcabf]">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Try It Out */}
        <div className="mt-10 border border-[#4edea3]/30 bg-[#4edea3]/5 p-6">
          <h3 className="mb-2 font-jetbrains text-[13px] font-bold uppercase tracking-widest text-[#4edea3]">
            Try It Out
          </h3>
          <p className="mb-4 text-[14px] leading-relaxed text-[#bbcabf]">
            Head to the Editor page to test the audit functionality with a visual interface, or use the API directly for programmatic access.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 border border-[#4edea3] bg-[#10b981] px-4 py-2 font-jetbrains text-[11px] font-bold uppercase tracking-widest text-[#003824] transition-opacity hover:opacity-85"
          >
            <Zap className="h-3.5 w-3.5" />
            Go to Editor
          </Link>
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
