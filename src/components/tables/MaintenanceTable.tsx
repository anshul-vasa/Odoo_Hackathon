"use client";

import { useMemo, useState } from "react";
import { ArrowUpDown, Search, Wrench } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { MaintenanceActions } from "@/components/MaintenanceActions";
import { EmptyState } from "@/components/EmptyState";
import { useLanguage } from "@/lib/i18n/context";

export interface MaintenanceRowData {
  id: string;
  vehicleReg: string;
  description: string;
  cost: number;
  created_at: string;
  closed_at: string | null;
  status: string;
}

type SortKey = "vehicleReg" | "cost" | "created_at" | "status";

export function MaintenanceTable({
  records,
  canWrite,
}: {
  records: MaintenanceRowData[];
  canWrite: boolean;
}) {
  const { t } = useLanguage();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<string>("ALL");
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const statuses = useMemo(() => Array.from(new Set(records.map((r) => r.status))), [records]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let rows = records.filter((r) => {
      const matchesQuery =
        !q || r.vehicleReg.toLowerCase().includes(q) || r.description.toLowerCase().includes(q);
      const matchesStatus = status === "ALL" || r.status === status;
      return matchesQuery && matchesStatus;
    });
    rows = [...rows].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      const cmp = typeof av === "number" && typeof bv === "number" ? av - bv : String(av).localeCompare(String(bv));
      return sortDir === "asc" ? cmp : -cmp;
    });
    return rows;
  }, [records, query, status, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  function SortHeader({ label, sortField }: { label: string; sortField: SortKey }) {
    return (
      <th
        className="cursor-pointer select-none px-4 py-3 hover:text-slate-700 dark:hover:text-slate-200"
        onClick={() => toggleSort(sortField)}
      >
        <span className="inline-flex items-center gap-1">
          {label}
          <ArrowUpDown size={12} className={sortKey === sortField ? "text-brand-600 dark:text-brand-400" : "opacity-40"} />
        </span>
      </th>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 p-3 dark:border-slate-800">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("searchMaintenancePlaceholder")}
            className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-8 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
        >
          <option value="ALL">{t("allStatuses")}</option>
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s.replace("_", " ")}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Wrench}
          title={records.length === 0 ? t("noMaintenanceYet") : t("noSearchMatch")}
          message={records.length === 0 ? t("noMaintenanceYetMessage") : t("noSearchMatchMessage")}
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
              <tr>
                <SortHeader label={t("vehicle")} sortField="vehicleReg" />
                <th className="px-4 py-3">{t("description")}</th>
                <SortHeader label={t("cost")} sortField="cost" />
                <SortHeader label={t("opened")} sortField="created_at" />
                <th className="px-4 py-3">{t("closed")}</th>
                <SortHeader label={t("status")} sortField="status" />
                {canWrite && <th className="px-4 py-3">{t("actions")}</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">{r.vehicleReg}</td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{r.description}</td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300">₹{r.cost.toLocaleString()}</td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{r.created_at.slice(0, 10)}</td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                    {r.closed_at ? r.closed_at.slice(0, 10) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={r.status} />
                  </td>
                  {canWrite && (
                    <td className="px-4 py-3">
                      <MaintenanceActions recordId={r.id} status={r.status} />
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
