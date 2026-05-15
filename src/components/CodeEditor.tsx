"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface CodeEditorProps {
  value: string; onChange: (v: string) => void; highlightLines?: number[]; disabled?: boolean;
}

export function CodeEditor({ value, onChange, highlightLines = [], disabled }: CodeEditorProps) {
  const lines = value.split("\n");
  const hlSet = new Set(highlightLines);
  const [scrollTop, setScrollTop] = useState(0);
  const ref = useRef<HTMLTextAreaElement>(null);
  const LH = 22;

  return (
    <div className="group relative flex min-h-[460px] overflow-hidden rounded-xl border border-green-500/10 bg-[#050a07] shadow-2xl shadow-black/50 transition-all hover:border-green-500/20">
      {/* titlebar */}
      <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between border-b border-green-500/8 bg-[#050a07]/95 px-4 py-2.5 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
            <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
            <span className="h-3 w-3 rounded-full bg-[#28c840]" />
          </div>
          <span className="ml-2 font-mono text-[10px] text-zinc-700">contract.sol</span>
        </div>
        <div className="flex items-center gap-3">
          {highlightLines.length > 0 && (
            <div className="flex items-center gap-1.5 rounded-md border border-green-500/20 bg-green-500/5 px-2 py-0.5">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-glow" />
              <span className="font-mono text-[9px] text-green-400">{highlightLines.length} flagged</span>
            </div>
          )}
          <span className="font-mono text-[9px] text-zinc-700">Solidity</span>
        </div>
      </div>

      {/* line numbers */}
      <div className="flex shrink-0 select-none flex-col overflow-hidden border-r border-green-500/8 bg-black/20 pb-4 pl-3 pr-3 pt-10 text-right font-mono text-[11px]" style={{ transform: `translateY(-${scrollTop}px)`, marginTop: "40px" }}>
        {lines.map((_, i) => (
          <span key={i} className={cn("tabular-nums leading-[22px] transition-colors", hlSet.has(i + 1) ? "font-semibold text-green-500" : "text-zinc-800")}>
            {i + 1}
          </span>
        ))}
      </div>

      {/* highlight overlay */}
      <div className="pointer-events-none absolute left-[52px] right-0 top-[40px] overflow-hidden" style={{ transform: `translateY(-${scrollTop}px)` }}>
        {lines.map((_, i) =>
          hlSet.has(i + 1)
            ? <div key={i} className="line-highlight" style={{ height: `${LH}px`, marginTop: i === 0 ? "10px" : 0 }} />
            : <div key={i} style={{ height: `${LH}px`, marginTop: i === 0 ? "10px" : 0 }} />
        )}
      </div>

      {/* textarea */}
      <textarea
        ref={ref} value={value}
        onChange={(e) => onChange(e.target.value)}
        onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
        disabled={disabled} spellCheck={false}
        className={cn("relative z-10 w-full resize-none bg-transparent pb-4 pl-3 pr-4 pt-[50px] font-mono text-[12.5px] leading-[22px] text-zinc-300 placeholder:text-zinc-800 focus:outline-none disabled:cursor-not-allowed disabled:opacity-40")}
        placeholder={"// Paste your Solidity contract here...\n// e.g. pragma solidity ^0.8.0;"}
      />
    </div>
  );
}
