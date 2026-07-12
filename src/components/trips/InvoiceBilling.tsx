"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileDown, Receipt } from "lucide-react";
import { useToast } from "@/lib/toast-context";
import type { Invoice, Trip } from "@/lib/types";

const GST_RATES = [0, 5, 12, 18, 28];

export function InvoiceBilling({
  trip,
  invoice,
  canWrite,
}: {
  trip: Trip;
  invoice: Invoice | null;
  canWrite: boolean;
}) {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const suggestedAmount = Math.max(500, Math.round((trip.actual_distance ?? trip.planned_distance) * 35));
  const [taxableAmount, setTaxableAmount] = useState(String(suggestedAmount));
  const [gstRate, setGstRate] = useState("5");
  const [taxType, setTaxType] = useState<"CGST_SGST" | "IGST">("CGST_SGST");

  async function generate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/trips/${trip.id}/invoice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taxableAmount: Number(taxableAmount),
          gstRate: Number(gstRate),
          taxType,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Could not generate invoice.");
        return;
      }
      toast.success("Invoice generated.");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function downloadPdf() {
    if (!invoice) return;
    const { default: jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 14;

    doc.setFillColor(79, 70, 229);
    doc.rect(0, 0, pageWidth, 26, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Tax Invoice", margin, 13);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`Invoice ${invoice.invoice_number}`, margin, 20);
    doc.setTextColor(0, 0, 0);

    let y = 38;
    const line = (label: string, value: string) => {
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(label, margin, y);
      doc.setFont("helvetica", "normal");
      doc.text(value, margin + 55, y);
      y += 7;
    };

    line("Trip route:", `${trip.source} -> ${trip.destination}`);
    line("Distance:", `${trip.actual_distance ?? trip.planned_distance} km`);
    line("Taxable amount:", `Rs. ${invoice.taxable_amount.toLocaleString("en-IN")}`);
    line("GST rate:", `${invoice.gst_rate}%`);
    if (invoice.tax_type === "CGST_SGST") {
      line("CGST:", `Rs. ${invoice.cgst_amount.toLocaleString("en-IN")}`);
      line("SGST:", `Rs. ${invoice.sgst_amount.toLocaleString("en-IN")}`);
    } else {
      line("IGST:", `Rs. ${invoice.igst_amount.toLocaleString("en-IN")}`);
    }
    y += 2;
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text(`Total: Rs. ${invoice.total_amount.toLocaleString("en-IN")}`, margin, y);
    y += 12;

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("E-Way Bill", margin, y);
    y += 7;
    line("E-way bill no.:", invoice.eway_bill_number);
    line("Valid until:", new Date(invoice.eway_bill_valid_until).toLocaleDateString("en-IN"));
    line("Required:", invoice.eway_bill_required ? "Yes (value > Rs. 50,000)" : "No (below threshold)");

    doc.save(`invoice-${invoice.invoice_number}.pdf`);
  }

  if (invoice) {
    return (
      <div className="max-w-lg rounded-xl border border-slate-200 bg-white p-5 shadow-card dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt size={18} className="text-brand-600 dark:text-brand-400" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{invoice.invoice_number}</h3>
          </div>
          <button
            onClick={downloadPdf}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <FileDown size={13} /> Download PDF
          </button>
        </div>

        <dl className="grid grid-cols-2 gap-y-2 text-sm">
          <dt className="text-slate-500 dark:text-slate-400">Taxable amount</dt>
          <dd className="text-right font-medium text-slate-900 dark:text-white">
            ₹{invoice.taxable_amount.toLocaleString("en-IN")}
          </dd>
          <dt className="text-slate-500 dark:text-slate-400">GST rate</dt>
          <dd className="text-right font-medium text-slate-900 dark:text-white">{invoice.gst_rate}%</dd>
          {invoice.tax_type === "CGST_SGST" ? (
            <>
              <dt className="text-slate-500 dark:text-slate-400">CGST + SGST</dt>
              <dd className="text-right font-medium text-slate-900 dark:text-white">
                ₹{invoice.cgst_amount.toLocaleString("en-IN")} + ₹{invoice.sgst_amount.toLocaleString("en-IN")}
              </dd>
            </>
          ) : (
            <>
              <dt className="text-slate-500 dark:text-slate-400">IGST</dt>
              <dd className="text-right font-medium text-slate-900 dark:text-white">
                ₹{invoice.igst_amount.toLocaleString("en-IN")}
              </dd>
            </>
          )}
          <dt className="border-t border-slate-100 pt-2 font-semibold text-slate-700 dark:border-slate-800 dark:text-slate-200">
            Total
          </dt>
          <dd className="border-t border-slate-100 pt-2 text-right text-base font-bold text-slate-900 dark:border-slate-800 dark:text-white">
            ₹{invoice.total_amount.toLocaleString("en-IN")}
          </dd>
        </dl>

        <div className="mt-4 rounded-lg bg-slate-50 p-3 text-xs dark:bg-slate-800/60">
          <p className="font-semibold text-slate-700 dark:text-slate-200">E-way Bill</p>
          <p className="mt-1 text-slate-600 dark:text-slate-300">No. {invoice.eway_bill_number}</p>
          <p className="text-slate-600 dark:text-slate-300">
            Valid until {new Date(invoice.eway_bill_valid_until).toLocaleDateString("en-IN")}
          </p>
          <p className={invoice.eway_bill_required ? "mt-1 font-medium text-amber-600 dark:text-amber-400" : "mt-1 text-slate-500 dark:text-slate-400"}>
            {invoice.eway_bill_required
              ? "Required — consignment value exceeds ₹50,000."
              : "Not mandatory — below the ₹50,000 threshold, generated for record-keeping."}
          </p>
        </div>
      </div>
    );
  }

  if (!canWrite) {
    return <p className="text-sm text-slate-400">No invoice has been generated for this trip yet.</p>;
  }

  return (
    <form onSubmit={generate} className="max-w-md space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-card dark:border-slate-800 dark:bg-slate-900">
      <p className="text-sm text-slate-500 dark:text-slate-400">
        No invoice yet — generate one for this trip with GST and an e-way bill reference.
      </p>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Taxable Amount (₹)</label>
        <input
          type="number"
          min="1"
          required
          value={taxableAmount}
          onChange={(e) => setTaxableAmount(e.target.value)}
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">GST Rate</label>
        <select
          value={gstRate}
          onChange={(e) => setGstRate(e.target.value)}
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        >
          {GST_RATES.map((r) => (
            <option key={r} value={r}>{r}% {r === 5 ? "(GTA rate)" : ""}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Tax Type</label>
        <div className="flex gap-4 text-sm text-slate-700 dark:text-slate-300">
          <label className="flex items-center gap-1.5">
            <input type="radio" checked={taxType === "CGST_SGST"} onChange={() => setTaxType("CGST_SGST")} />
            CGST + SGST (intra-state)
          </label>
          <label className="flex items-center gap-1.5">
            <input type="radio" checked={taxType === "IGST"} onChange={() => setTaxType("IGST")} />
            IGST (inter-state)
          </label>
        </div>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
      >
        {loading ? "Generating..." : "Generate Invoice"}
      </button>
    </form>
  );
}
