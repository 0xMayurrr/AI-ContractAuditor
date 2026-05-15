"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface SecurityScoreProps {
  score: number; grade: string; findingCount: number; loading?: boolean; idle?: boolean;
}

export function SecurityScore({ score, grade, findingCount, loading, idle }: SecurityScoreProps) {
  const [display, setDisplay] = useState(0);
  const r = 70;
  const circ = 2 * Math.PI * r;
  const offset = circ - (display / 100) * circ;

  useEffect(() => {
    if (idle || loading) { setDisplay(0); return; }
    let cur = 0;
    const step = score / 50;
    const t = setInterval(() => {
      cur += step;
      if (cur >= score) { setDisplay(score); clearInterval(t); }
      else setDisplay(Math.floor(cur));
    }, 16);
    return () => clearInterval(t);
  }, [score, idle, loading]);

  const isGood = score >= 80;
  const isMid  = score >= 60 && score < 80;
  const strokeColor = isGood ? "#4edea3" : isMid ? "#f59e0b" : "#ffb4ab";
  const scoreColor  = isGood ? "text-[#4edea3]" : isMid ? "text-amber-400" : "text-[#ffb4ab]";
  const statusLabel = isGood ? "SECURE" : isMid ? "AT RISK" : "CRITICAL";
  const statusColor = isGood ? "text-[#4edea3]" : isMid ? "text-amber-400" : "text-[#ffb4ab]";

  return (
    <div>
      {/* Gauge */}
      <div className="flex items-center justify-center py-2">
        <div className="relative">
          <svg width="160" height="160" className="-rotate-90">
            <circle cx="80" cy="80" r={r} fill="transparent" stroke="#262626" strokeWidth="8" />
            <circle
              cx="80" cy="80" r={r}
              fill="transparent"
              stroke={loading ? "#262626" : strokeColor}
              strokeWidth="8"
              strokeDasharray={circ}
              strokeDashoffset={loading ? circ : offset}
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 1s ease-out, stroke 0.5s ease" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {loading ? (
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#4edea3] border-t-transparent" />
            ) : idle ? (
              <>
                <span className="font-jetbrains text-[28px] font-bold text-[#353534]">--</span>
                <span className="font-jetbrains text-[10px] uppercase tracking-widest text-[#3c4a42]">Awaiting</span>
              </>
            ) : (
              <>
                <span className={cn("font-jetbrains text-[32px] font-bold leading-none", scoreColor)}>{display}</span>
                <span className={cn("font-jetbrains text-[10px] uppercase tracking-widest", statusColor)}>{statusLabel}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Stats row */}
      {!idle && !loading && (
        <div className="mt-2 flex justify-between border-t border-[#262626] pt-3 font-jetbrains text-[11px]">
          <span className="text-[#86948a]">
            Static Analysis:{" "}
            <span className={score >= 60 ? "text-[#e5e2e1]" : "text-[#ffb4ab]"}>
              {score >= 60 ? "PASSED" : "FAILED"}
            </span>
          </span>
          <span className="text-[#86948a]">
            Grade: <span className="text-[#e5e2e1]">{grade}</span>
          </span>
        </div>
      )}

      {!idle && !loading && (
        <div className="mt-2 font-jetbrains text-[11px] text-[#86948a]">
          {findingCount === 0
            ? <span className="text-[#4edea3]">✓ No vulnerabilities detected</span>
            : <><span className="text-[#e5e2e1]">{findingCount}</span> finding{findingCount !== 1 ? "s" : ""} detected</>
          }
        </div>
      )}
    </div>
  );
}
