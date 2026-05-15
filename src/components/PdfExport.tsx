"use client";

import { useState } from "react";
import type { AuditReport } from "@/types/audit";
import { cn } from "@/lib/utils";
import { FileDown, Loader2 } from "lucide-react";

interface PdfExportProps {
  report: AuditReport;
}

export function PdfExport({ report }: PdfExportProps) {
  const [exporting, setExporting] = useState(false);

  async function exportPdf() {
    setExporting(true);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

      const W = 210;
      const margin = 16;
      const contentW = W - margin * 2;
      let y = 0;

      // ── helpers ──
      const hex = (h: string) => {
        const r = parseInt(h.slice(1, 3), 16);
        const g = parseInt(h.slice(3, 5), 16);
        const b = parseInt(h.slice(5, 7), 16);
        return [r, g, b] as [number, number, number];
      };
      const setFill  = (h: string) => doc.setFillColor(...hex(h));
      const setStroke = (h: string) => doc.setDrawColor(...hex(h));
      const setTxt   = (h: string) => doc.setTextColor(...hex(h));

      const addPage = () => { doc.addPage(); y = margin; };
      const checkY  = (need: number) => { if (y + need > 280) addPage(); };

      const wrapText = (text: string, maxW: number, size: number): string[] => {
        doc.setFontSize(size);
        return doc.splitTextToSize(text, maxW) as string[];
      };

      // ── COVER PAGE ──
      // Dark background
      setFill("#020206"); doc.rect(0, 0, W, 297, "F");

      // Top gradient bar
      setFill("#7c3aed"); doc.rect(0, 0, W, 2, "F");

      // Logo circle
      setFill("#7c3aed");
      doc.circle(margin + 8, 28, 8, "F");
      setTxt("#ffffff"); doc.setFontSize(10); doc.setFont("helvetica", "bold");
      doc.text("CA", margin + 4.5, 31);

      // Title
      setTxt("#ffffff"); doc.setFontSize(26); doc.setFont("helvetica", "bold");
      doc.text("Smart Contract", margin + 22, 26);
      setTxt("#a78bfa"); doc.setFontSize(26);
      doc.text("Audit Report", margin + 22, 35);

      // Subtitle
      setTxt("#71717a"); doc.setFontSize(9); doc.setFont("helvetica", "normal");
      doc.text("AI-Powered Security Analysis · NodeOps CreateOS", margin + 22, 42);

      // Divider
      setFill("#27272a"); doc.rect(margin, 50, contentW, 0.4, "F");

      // Contract info box
      setFill("#0f0f14"); doc.roundedRect(margin, 56, contentW, 36, 3, 3, "F");
      setStroke("#3f3f46"); doc.setLineWidth(0.3); doc.roundedRect(margin, 56, contentW, 36, 3, 3, "S");

      setTxt("#71717a"); doc.setFontSize(7); doc.setFont("helvetica", "bold");
      doc.text("CONTRACT", margin + 6, 64);
      setTxt("#e4e4e7"); doc.setFontSize(13); doc.setFont("helvetica", "bold");
      doc.text(report.contractName, margin + 6, 72);

      setTxt("#71717a"); doc.setFontSize(7);
      doc.text("ANALYZED", margin + 6, 80);
      setTxt("#a1a1aa"); doc.setFontSize(9); doc.setFont("helvetica", "normal");
      doc.text(new Date(report.analyzedAt).toLocaleString(), margin + 6, 86);

      setTxt("#71717a"); doc.setFontSize(7); doc.setFont("helvetica", "bold");
      doc.text("LINES OF CODE", margin + contentW / 2, 64);
      setTxt("#e4e4e7"); doc.setFontSize(13); doc.setFont("helvetica", "bold");
      doc.text(String(report.lineCount), margin + contentW / 2, 72);

      // Score card
      const scoreColor = report.securityScore >= 80 ? "#22c55e" : report.securityScore >= 60 ? "#f59e0b" : "#ef4444";
      setFill("#0f0f14"); doc.roundedRect(margin, 98, 58, 52, 3, 3, "F");
      setStroke(scoreColor); doc.setLineWidth(0.5); doc.roundedRect(margin, 98, 58, 52, 3, 3, "S");

      setTxt("#71717a"); doc.setFontSize(7); doc.setFont("helvetica", "bold");
      doc.text("SECURITY SCORE", margin + 6, 107);
      doc.setFontSize(32); doc.setFont("helvetica", "bold");
      doc.setTextColor(...hex(scoreColor));
      doc.text(String(report.securityScore), margin + 6, 126);
      setTxt("#71717a"); doc.setFontSize(9);
      doc.text("/ 100", margin + 6, 134);
      setTxt("#a1a1aa"); doc.setFontSize(8);
      doc.text(`Grade: ${report.grade}`, margin + 6, 143);

      // Severity breakdown
      const sevCounts = { critical: 0, high: 0, medium: 0, low: 0 };
      report.findings.forEach((f) => { if (f.severity in sevCounts) sevCounts[f.severity as keyof typeof sevCounts]++; });
      const sevColors: Record<string, string> = { critical: "#ef4444", high: "#f97316", medium: "#f59e0b", low: "#3b82f6" };
      const sevX = margin + 64;
      setFill("#0f0f14"); doc.roundedRect(sevX, 98, contentW - 64, 52, 3, 3, "F");
      setStroke("#27272a"); doc.setLineWidth(0.3); doc.roundedRect(sevX, 98, contentW - 64, 52, 3, 3, "S");

      setTxt("#71717a"); doc.setFontSize(7); doc.setFont("helvetica", "bold");
      doc.text("FINDINGS BREAKDOWN", sevX + 6, 107);

      let bx = sevX + 6;
      Object.entries(sevCounts).forEach(([sev, count]) => {
        if (count === 0) return;
        setFill(sevColors[sev] + "33");
        doc.roundedRect(bx, 111, 28, 14, 2, 2, "F");
        doc.setTextColor(...hex(sevColors[sev]));
        doc.setFontSize(14); doc.setFont("helvetica", "bold");
        doc.text(String(count), bx + 4, 121);
        setTxt("#71717a"); doc.setFontSize(6);
        doc.text(sev.toUpperCase(), bx + 4, 127);
        bx += 32;
      });

      // Summary
      setFill("#0f0f14"); doc.roundedRect(margin, 156, contentW, 28, 3, 3, "F");
      setStroke("#27272a"); doc.setLineWidth(0.3); doc.roundedRect(margin, 156, contentW, 28, 3, 3, "S");
      setTxt("#71717a"); doc.setFontSize(7); doc.setFont("helvetica", "bold");
      doc.text("SUMMARY", margin + 6, 164);
      setTxt("#a1a1aa"); doc.setFontSize(8); doc.setFont("helvetica", "normal");
      const summaryLines = wrapText(report.summary, contentW - 12, 8);
      summaryLines.slice(0, 3).forEach((line, i) => doc.text(line, margin + 6, 171 + i * 5));

      // AI badge
      if (report.aiEnhanced) {
        setFill("#4c1d95");
        doc.roundedRect(margin, 190, 28, 8, 2, 2, "F");
        setTxt("#c4b5fd"); doc.setFontSize(7); doc.setFont("helvetica", "bold");
        doc.text("✦ AI ENHANCED", margin + 3, 196);
      }

      // Footer
      setFill("#27272a"); doc.rect(0, 285, W, 0.4, "F");
      setTxt("#52525b"); doc.setFontSize(7); doc.setFont("helvetica", "normal");
      doc.text("ContractAudit AI · NodeOps CreateOS · Forward Deployed Engineer Challenge", margin, 292);
      doc.text("Page 1", W - margin - 10, 292);

      // ── FINDINGS PAGES ──
      if (report.findings.length > 0) {
        addPage();

        // Page header
        setFill("#020206"); doc.rect(0, 0, W, 297, "F");
        setFill("#7c3aed"); doc.rect(0, 0, W, 1.5, "F");
        setTxt("#ffffff"); doc.setFontSize(16); doc.setFont("helvetica", "bold");
        doc.text("Audit Findings", margin, y + 8);
        setTxt("#71717a"); doc.setFontSize(8); doc.setFont("helvetica", "normal");
        doc.text(`${report.findings.length} issue${report.findings.length !== 1 ? "s" : ""} detected`, margin, y + 15);
        setFill("#27272a"); doc.rect(margin, y + 18, contentW, 0.3, "F");
        y += 24;

        report.findings.forEach((finding, idx) => {
          const sevColor = sevColors[finding.severity] ?? "#71717a";
          const expLines = wrapText(finding.explanation, contentW - 12, 8);
          const recLines = wrapText(finding.recommendation, contentW - 12, 8);
          const cardH = 14 + expLines.length * 4.5 + recLines.length * 4.5 + 22;

          checkY(cardH + 4);

          // Card bg
          setFill("#0a0a0f"); doc.roundedRect(margin, y, contentW, cardH, 3, 3, "F");
          // Left accent bar
          doc.setTextColor(...hex(sevColor));
          setFill(sevColor); doc.rect(margin, y, 2.5, cardH, "F");
          // Top border
          setStroke(sevColor + "44"); doc.setLineWidth(0.3);
          doc.roundedRect(margin, y, contentW, cardH, 3, 3, "S");

          // Index + severity badge
          setFill(sevColor + "22");
          doc.roundedRect(margin + 6, y + 5, 22, 6, 1, 1, "F");
          doc.setTextColor(...hex(sevColor));
          doc.setFontSize(6); doc.setFont("helvetica", "bold");
          doc.text(finding.severity.toUpperCase(), margin + 8, y + 9.5);

          // Category
          setFill("#27272a");
          doc.roundedRect(margin + 31, y + 5, 30, 6, 1, 1, "F");
          setTxt("#71717a"); doc.setFontSize(6);
          doc.text(finding.category.toUpperCase(), margin + 33, y + 9.5);

          // Line refs
          if (finding.lines.length > 0) {
            setTxt("#fbbf24"); doc.setFontSize(6);
            doc.text(`Lines: ${finding.lines.join(", ")}`, W - margin - 30, y + 9.5);
          }

          // Title
          setTxt("#f4f4f5"); doc.setFontSize(9); doc.setFont("helvetica", "bold");
          doc.text(`${idx + 1}. ${finding.title}`, margin + 6, y + 18);

          // Explanation
          let ey = y + 23;
          setTxt("#a1a1aa"); doc.setFontSize(7.5); doc.setFont("helvetica", "normal");
          expLines.forEach((line) => { doc.text(line, margin + 6, ey); ey += 4.5; });

          // Recommendation box
          ey += 2;
          setFill("#052e16");
          doc.roundedRect(margin + 6, ey, contentW - 12, recLines.length * 4.5 + 7, 2, 2, "F");
          setTxt("#4ade80"); doc.setFontSize(6); doc.setFont("helvetica", "bold");
          doc.text("FIX", margin + 9, ey + 5);
          setTxt("#86efac"); doc.setFontSize(7); doc.setFont("helvetica", "normal");
          recLines.forEach((line, i) => doc.text(line, margin + 16, ey + 5 + i * 4.5));

          y += cardH + 4;
        });
      }

      // ── Save ──
      doc.save(`audit-${report.contractName}-${Date.now()}.pdf`);
    } finally {
      setExporting(false);
    }
  }

  return (
    <button
      type="button"
      onClick={exportPdf}
      disabled={exporting}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-[11px] font-medium transition-all duration-150",
        "border-green-500/20 bg-green-500/5 text-green-500",
        "hover:bg-green-500/10 hover:border-green-500/30",
        "disabled:opacity-40"
      )}
    >
      {exporting ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <FileDown className="h-3 w-3" />
      )}
      {exporting ? "Generating…" : "Export PDF"}
    </button>
  );
}
