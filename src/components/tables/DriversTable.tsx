"use client";

import { useMemo, useState } from "react";
import { ArrowUpDown, Search, UserRound } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { DriverActions } from "@/components/DriverActions";
import { EmptyState } from "@/components/EmptyState";
import { useLanguage } from "@/lib/i18n/context";
import type { Driver } from "@/lib/types";

type SortKey = "name" | "license_number" | "safety_score" | "license_expiry_date" | "status";

function isLicenseExpired(driver: Driver): boolean {
  return new Date(driver.license_expiry_date).getTime() < Date.now();
}

export function DriversTable({
  drivers,
  canWrite,
}: {
  drivers: Driver[];
  canWrite: boolean;
}) {
  const { t } = useLanguage();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<string>("ALL");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const statuses = useMemo(() => Array.from(new Set(drivers.map((d) => d.status))), [drivers]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let rows = drivers.filter((d) => {
      const matchesQuery =
        !q ||
        d.name.toLowerCase().includes(q) ||
        d.license_number.toLowerCase().includes(q) ||
        d.license_category.toLowerCase().includes(q);
      const matchesStatus = status === "ALL" || d.status === status;
      return matchesQuery && matchesStatus;
    });
    rows = [...rows].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      const cmp = typeof av === "number" && typeof bv === "number" ? av - bv : String(av).localeCompare(String(bv));
      return sortDir === "asc" ? cmp : -cmp;
    });
    return rows;
  }, [drivers, query, status, sortKey, sortDir]);

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
            placeholder={t("searchDriversPlaceholder")}
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
          icon={UserRound}
          title={drivers.length === 0 ? t("noDriversYet") : t("noSearchMatch")}
          message={drivers.length === 0 ? t("noDriversYetMessage") : t("noSearchMatchMessage")}
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
              <tr>
                <SortHeader label={t("name")} sortField="name" />
                <SortHeader label={t("licenseNumber")} sortField="license_number" />
                <th className="px-4 py-3">{t("category")}</th>
                <SortHeader label={t("licenseExpiry")} sortField="license_expiry_date" />
                <SortHeader label={t("safetyScore")} sortField="safety_score" />
                <SortHeader label={t("status")} sortField="status" />
                {canWrite && <th className="px-4 py-3">{t("actions")}</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((d) => {
                const expired = isLicenseExpired(d);
                return (
                  <tr key={d.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">{d.name}</td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{d.license_number}</td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{d.license_category}</td>
                    <td className="px-4 py-3">
                      <span className={expired ? "font-semibold text-red-600 dark:text-red-400" : "text-slate-700 dark:text-slate-300"}>
                        {d.license_expiry_date.slice(0, 10)}
                        {expired ? " (expired)" : ""}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{d.safety_score}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={d.status} />
                    </td>
                    {canWrite && (
                      <td className="px-4 py-3">
                        <DriverActions driverId={d.id} status={d.status} driverName={d.name} />
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
