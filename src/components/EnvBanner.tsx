"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp, Settings2 } from "lucide-react";

interface EnvStatus {
  key: string;
  label: string;
  set: boolean;
  required: boolean;
  hint: string;
}

export function EnvBanner() {
  const [vars, setVars] = useState<EnvStatus[]>([]);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    // Fetch env status from API
    fetch("/api/env-status")
      .then((r) => r.json())
      .then((data: EnvStatus[]) => setVars(data))
      .catch(() => {});
  }, []);

  if (vars.length === 0) return null;

  const missing = vars.filter((v) => v.required && !v.set);
  const allGood = missing.length === 0;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border transition-all duration-300",
        allGood
          ? "border-emerald-500/20 bg-emerald-500/5"
          : "border-amber-500/20 bg-amber-500/5"
      )}
    >
      {/* Header row */}
      <button
        type="button"
        onClick={() => setExpanded((p) => !p)}
        className="flex w-full items-center justify-between px-4 py-3"
      >
        <div className="flex items-center gap-2.5">
          <Settings2 className={cn("h-4 w-4", allGood ? "text-emerald-400" : "text-amber-400")} />
          <span className={cn("text-xs font-semibold", allGood ? "text-emerald-300" : "text-amber-300")}>
            CreateOS Environment
          </span>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[9px] font-bold",
              allGood
                ? "bg-emerald-500/20 text-emerald-400"
                : "bg-amber-500/20 text-amber-400"
            )}
          >
            {allGood ? "All configured" : `${missing.length} missing`}
          </span>
        </div>
        {expanded ? (
          <ChevronUp className="h-3.5 w-3.5 text-zinc-500" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 text-zinc-500" />
        )}
      </button>

      {/* Expanded vars */}
      {expanded && (
        <div className="border-t border-white/5 px-4 pb-3 pt-2">
          <div className="grid gap-1.5 sm:grid-cols-2">
            {vars.map((v) => (
              <div
                key={v.key}
                className={cn(
                  "flex items-center justify-between rounded-lg px-3 py-2",
                  v.set ? "bg-white/[0.02]" : "bg-red-500/5"
                )}
              >
                <div className="min-w-0">
                  <p className="font-mono text-[10px] font-semibold text-zinc-300">{v.key}</p>
                  <p className="text-[9px] text-zinc-600">{v.hint}</p>
                </div>
                <div className="ml-2 shrink-0 flex items-center gap-1.5">
                  {v.required && !v.set && (
                    <span className="text-[8px] font-bold text-red-400">REQUIRED</span>
                  )}
                  <div
                    className={cn(
                      "h-2 w-2 rounded-full",
                      v.set ? "bg-emerald-400" : v.required ? "bg-red-400 animate-pulse" : "bg-zinc-600"
                    )}
                  />
                </div>
              </div>
            ))}
          </div>
          {!allGood && (
            <p className="mt-2 text-[10px] text-zinc-600">
              Set missing vars in your{" "}
              <code className="text-violet-400">.env.local</code> or CreateOS dashboard → Environment Variables.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
