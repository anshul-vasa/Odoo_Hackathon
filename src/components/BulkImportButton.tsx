"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, X, Loader2 } from "lucide-react";
import { useToast } from "@/lib/toast-context";

interface BulkImportButtonProps {
  label: string;
  endpoint: string;
  templateHeaders: string[];
  templateSampleRow: (string | number)[];
  templateFilename: string;
}

interface ImportResult {
  successCount: number;
  errorCount: number;
  errors: { row: number; message: string }[];
}

export function BulkImportButton({
  label,
  endpoint,
  templateHeaders,
  templateSampleRow,
  templateFilename,
}: BulkImportButtonProps) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState<Record<string, string>[] | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const toast = useToast();

  function reset() {
    setPreview(null);
    setFileName(null);
    setResult(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  function downloadTemplate() {
    const escape = (v: string | number) => {
      const s = String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const lines = [templateHeaders.map(escape).join(","), templateSampleRow.map(escape).join(",")];
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${templateFilename}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleFile(file: File) {
    setFileName(file.name);
    setResult(null);
    const XLSX = await import("xlsx");
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf, { type: "array" });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<Record<string, string>>(ws, { defval: "", raw: false });
    setPreview(rows);
  }

  async function submit() {
    if (!preview || preview.length === 0) return;
    setBusy(true);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: preview }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Import failed.");
        return;
      }
      setResult(data);
      if (data.successCount > 0) {
        toast.success(`Imported ${data.successCount} record${data.successCount === 1 ? "" : "s"}.`);
        router.refresh();
      }
      if (data.errorCount > 0) {
        toast.error(`${data.errorCount} row${data.errorCount === 1 ? "" : "s"} failed — see details below.`);
      }
    } catch {
      toast.error("Import failed — could not reach the server.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
      >
        <Upload size={15} /> {label}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-5 shadow-xl dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">{label}</h2>
              <button
                onClick={() => {
                  setOpen(false);
                  reset();
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X size={18} />
              </button>
            </div>

            <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">
              Upload a CSV or Excel file. Not sure of the format?{" "}
              <button onClick={downloadTemplate} className="font-semibold text-brand-600 hover:underline dark:text-brand-400">
                Download a template
              </button>
              .
            </p>

            <input
              ref={inputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
              className="mb-3 block w-full text-sm text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-brand-700 hover:file:bg-brand-100 dark:text-slate-300 dark:file:bg-brand-900/40 dark:file:text-brand-300"
            />

            {preview && (
              <div className="mb-3 max-h-40 overflow-auto rounded-lg border border-slate-200 text-xs dark:border-slate-800">
                <p className="border-b border-slate-200 bg-slate-50 px-3 py-1.5 font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-300">
                  {fileName} — {preview.length} row{preview.length === 1 ? "" : "s"} detected
                </p>
              </div>
            )}

            {result && (
              <div className="mb-3 max-h-40 overflow-auto rounded-lg border border-slate-200 text-xs dark:border-slate-800">
                <p className="px-3 py-1.5 text-slate-600 dark:text-slate-300">
                  {result.successCount} imported, {result.errorCount} failed.
                </p>
                {result.errors.length > 0 && (
                  <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                    {result.errors.map((e) => (
                      <li key={e.row} className="px-3 py-1 text-red-600 dark:text-red-400">
                        Row {e.row}: {e.message}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setOpen(false);
                  reset();
                }}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Close
              </button>
              <button
                onClick={submit}
                disabled={!preview || preview.length === 0 || busy}
                className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
              >
                {busy && <Loader2 size={14} className="animate-spin" />}
                Import
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
