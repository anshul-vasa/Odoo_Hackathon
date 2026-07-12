"use client";

import { useState } from "react";
import { FileSpreadsheet, FileText, FileDown } from "lucide-react";

interface ChartSeries {
  label: string;
  data: { name: string; value: number }[];
  color?: [number, number, number];
}

interface ExportButtonsProps {
  filename: string;
  headers: string[];
  rows: (string | number)[][];
  title?: string;
  /** Optional: renders a horizontal bar chart section in the PDF (e.g. top cost vehicles). */
  barChart?: ChartSeries;
  /** Optional: renders a line-chart section (e.g. 30-day trend) in the PDF. */
  lineChart?: ChartSeries;
}

const BRAND = { r: 79, g: 70, b: 229 }; // matches Tailwind brand-600

export function ExportButtons({ filename, headers, rows, title, barChart, lineChart }: ExportButtonsProps) {
  const [busy, setBusy] = useState<string | null>(null);

  function downloadBlob(blob: Blob, ext: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportCsv() {
    setBusy("csv");
    try {
      const escape = (v: string | number) => {
        const s = String(v);
        return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
      };
      const lines = [headers.map(escape).join(","), ...rows.map((r) => r.map(escape).join(","))];
      downloadBlob(new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" }), "csv");
    } finally {
      setBusy(null);
    }
  }

  async function exportPdf() {
    setBusy("pdf");
    try {
      const { default: jsPDF } = await import("jspdf");
      const autoTable = (await import("jspdf-autotable")).default;
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 14;

      // --- Branded header banner ---
      doc.setFillColor(BRAND.r, BRAND.g, BRAND.b);
      doc.rect(0, 0, pageWidth, 28, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text(title ?? filename, margin, 14);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text(
        `Generated ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })} · TransitOps`,
        margin,
        21
      );
      doc.setTextColor(0, 0, 0);

      let cursorY = 38;

      // --- Hand-drawn horizontal bar chart (no headless-browser/canvas dependency needed) ---
      if (barChart && barChart.data.length > 0) {
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text(barChart.label, margin, cursorY);
        cursorY += 6;

        const chartData = barChart.data.slice(0, 8);
        const maxVal = Math.max(...chartData.map((d) => d.value), 1);
        const barAreaWidth = pageWidth - margin * 2 - 45;
        const barHeight = 5;
        const gap = 3;
        const color = barChart.color ?? [79, 70, 229];

        chartData.forEach((d) => {
          doc.setFontSize(8);
          doc.setFont("helvetica", "normal");
          doc.text(d.name.slice(0, 14), margin, cursorY + barHeight - 1.2);
          const barWidth = Math.max((d.value / maxVal) * barAreaWidth, 1);
          doc.setFillColor(color[0], color[1], color[2]);
          doc.rect(margin + 42, cursorY, barWidth, barHeight, "F");
          doc.setFontSize(7.5);
          doc.text(d.value.toLocaleString("en-IN"), margin + 44 + barWidth, cursorY + barHeight - 1.2);
          cursorY += barHeight + gap;
        });
        cursorY += 6;
      }

      // --- Hand-drawn line chart (polyline through data points) ---
      if (lineChart && lineChart.data.length > 1) {
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text(lineChart.label, margin, cursorY);
        cursorY += 4;

        const chartW = pageWidth - margin * 2;
        const chartH = 32;
        const chartTop = cursorY;
        const values = lineChart.data.map((d) => d.value);
        const maxVal = Math.max(...values, 1);
        const color = lineChart.color ?? [245, 158, 11];

        // axis baseline
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, chartTop + chartH, margin + chartW, chartTop + chartH);

        const stepX = chartW / (lineChart.data.length - 1);
        doc.setDrawColor(color[0], color[1], color[2]);
        doc.setLineWidth(0.6);
        for (let i = 0; i < lineChart.data.length - 1; i++) {
          const x1 = margin + i * stepX;
          const y1 = chartTop + chartH - (values[i] / maxVal) * chartH;
          const x2 = margin + (i + 1) * stepX;
          const y2 = chartTop + chartH - (values[i + 1] / maxVal) * chartH;
          doc.line(x1, y1, x2, y2);
        }
        doc.setLineWidth(0.2);
        doc.setDrawColor(0, 0, 0);
        cursorY = chartTop + chartH + 10;
      }

      // --- Data table ---
      autoTable(doc, {
        head: [headers],
        body: rows.map((r) => r.map(String)),
        startY: cursorY,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [BRAND.r, BRAND.g, BRAND.b] },
      });

      doc.save(`${filename}.pdf`);
    } finally {
      setBusy(null);
    }
  }

  async function exportExcel() {
    setBusy("xlsx");
    try {
      const XLSX = await import("xlsx");
      const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Report");
      XLSX.writeFile(wb, `${filename}.xlsx`);
    } finally {
      setBusy(null);
    }
  }

  const btnClass =
    "inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800";

  return (
    <div className="flex flex-wrap gap-2">
      <button onClick={exportCsv} disabled={busy !== null} className={btnClass}>
        <FileDown size={14} /> CSV
      </button>
      <button onClick={exportPdf} disabled={busy !== null} className={btnClass}>
        <FileText size={14} /> PDF
      </button>
      <button onClick={exportExcel} disabled={busy !== null} className={btnClass}>
        <FileSpreadsheet size={14} /> Excel
      </button>
    </div>
  );
}
