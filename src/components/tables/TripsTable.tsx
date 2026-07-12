"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpDown, Search, Route } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { TripActions } from "@/components/TripActions";
import { EmptyState } from "@/components/EmptyState";
import { useLanguage } from "@/lib/i18n/context";

export interface TripRowData {
  id: string;
  source: string;
  destination: string;
  vehicleReg: string;
  driverName: string;
  cargo_weight: number;
  planned_distance: number;
  actual_distance: number | null;
  status: string;
  created_at: string;
}

type SortKey = "source" | "vehicleReg" | "driverName" | "cargo_weight" | "planned_distance" | "status" | "created_at";

export function TripsTable({ trips, canWrite }: { trips: TripRowData[]; canWrite: boolean }) {
  const { t } = useLanguage();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<string>("ALL");
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const statuses = useMemo(() => Array.from(new Set(trips.map((t) => t.status))), [trips]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let rows = trips.filter((t) => {
      const matchesQuery =
        !q ||
        t.source.toLowerCase().includes(q) ||
        t.destination.toLowerCase().includes(q) ||
        t.vehicleReg.toLowerCase().includes(q) ||
        t.driverName.toLowerCase().includes(q);
      const matchesStatus = status === "ALL" || t.status === status;
      return matchesQuery && matchesStatus;
    });
    rows = [...rows].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      const cmp = typeof av === "number" && typeof bv === "number" ? av - bv : String(av).localeCompare(String(bv));
      return sortDir === "asc" ? cmp : -cmp;
    });
    return rows;
  }, [trips, query, status, sortKey, sortDir]);

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
            placeholder={t("searchTripsPlaceholder")}
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
          icon={Route}
          title={trips.length === 0 ? t("noTripsYet") : t("noSearchMatch")}
          message={trips.length === 0 ? t("noTripsYetMessage") : t("noSearchMatchMessage")}
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
              <tr>
                <SortHeader label={t("route")} sortField="source" />
                <SortHeader label={t("vehicle")} sortField="vehicleReg" />
                <SortHeader label={t("driver")} sortField="driverName" />
                <SortHeader label={t("cargoWeight")} sortField="cargo_weight" />
                <SortHeader label={t("plannedActual")} sortField="planned_distance" />
                <SortHeader label={t("status")} sortField="status" />
                {canWrite && <th className="px-4 py-3">{t("actions")}</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                    <Link href={`/trips/${t.id}`} className="hover:text-brand-600 hover:underline">
                      {t.source} → {t.destination}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{t.vehicleReg}</td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{t.driverName}</td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{t.cargo_weight} kg</td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                    {t.planned_distance} km
                    {t.actual_distance != null ? ` / ${t.actual_distance} km` : ""}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={t.status} />
                  </td>
                  {canWrite && (
                    <td className="px-4 py-3">
                      <TripActions tripId={t.id} status={t.status} />
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
