import { NextResponse } from "next/server";
import { runAudit } from "@/lib/analyzer";
import { runAIAudit, enhanceFindingsWithAI } from "@/lib/ai";
import type { AuditRequest } from "@/types/audit";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AuditRequest;
    const code = body?.code?.trim();

    if (!code) {
      return NextResponse.json(
        { error: "Contract code is required." },
        { status: 400 }
      );
    }

    if (code.length > 100_000) {
      return NextResponse.json(
        { error: "Contract exceeds maximum size (100KB)." },
        { status: 400 }
      );
    }

    // ── STEP 1: Try full GPT-4o AI audit ──────────────────────
    // Only runs if OPENAI_API_KEY is set AND quota is available
    try {
      const aiReport = await runAIAudit(code);
      if (aiReport) {
        return NextResponse.json(aiReport);
      }
    } catch {
      // AI failed (quota exceeded, network error, etc.) → fall through to static
    }

    // ── STEP 2: Static analysis (always works, no API key needed) ──
    await new Promise((r) => setTimeout(r, 800));
    const base = runAudit(code);

    // ── STEP 3: Try to enrich static findings with AI explanations ──
    // (lighter AI call — just adds better text to existing findings)
    try {
      const { findings, enhanced } = await enhanceFindingsWithAI(
        code,
        base.findings
      );
      return NextResponse.json({ ...base, findings, aiEnhanced: enhanced });
    } catch {
      // Even enrichment failed → return pure static results
      return NextResponse.json({ ...base, aiEnhanced: false });
    }

  } catch {
    return NextResponse.json(
      { error: "Audit failed. Please try again." },
      { status: 500 }
    );
  }
}
