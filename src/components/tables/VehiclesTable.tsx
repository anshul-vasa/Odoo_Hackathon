"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpDown, Search, Truck } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { VehicleActions } from "@/components/VehicleActions";
import { EmptyState } from "@/components/EmptyState";
import { useLanguage } from "@/lib/i18n/context";
import type { Vehicle } from "@/lib/types";

type SortKey = "registration_number" | "name" | "type" | "max_load_capacity" | "status";

export function VehiclesTable({ vehicles, canWrite }: { vehicles: Vehicle[]; canWrite: boolean }) {
  const { t } = useLanguage();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<string>("ALL");
  const [sortKey, setSortKey] = useState<SortKey>("registration_number");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const statuses = useMemo(() => Array.from(new Set(vehicles.map((v) => v.status))), [vehicles]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let rows = vehicles.filter((v) => {
      const matchesQuery =
        !q ||
        v.registration_number.toLowerCase().includes(q) ||
        v.name.toLowerCase().includes(q) ||
        v.type.toLowerCase().includes(q) ||
        (v.region ?? "").toLowerCase().includes(q);
      const matchesStatus = status === "ALL" || v.status === status;
      return matchesQuery && matchesStatus;
    });
    rows = [...rows].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      const cmp = typeof av === "number" && typeof bv === "number" ? av - bv : String(av).localeCompare(String(bv));
      return sortDir === "asc" ? cmp : -cmp;
    });
    return rows;
  }, [vehicles, query, status, sortKey, sortDir]);

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
            placeholder={t("searchVehiclesPlaceholder")}
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
          icon={Truck}
          title={vehicles.length === 0 ? t("noVehiclesYet") : t("noSearchMatch")}
          message={vehicles.length === 0 ? t("noVehiclesYetMessage") : t("noSearchMatchMessage")}
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
              <tr>
                <SortHeader label={t("registrationNumber")} sortField="registration_number" />
                <SortHeader label={t("vehicleName")} sortField="name" />
                <SortHeader label={t("type")} sortField="type" />
                <SortHeader label={t("maxLoadCapacity")} sortField="max_load_capacity" />
                <th className="px-4 py-3">{t("region")}</th>
                <SortHeader label={t("status")} sortField="status" />
                {canWrite && <th className="px-4 py-3">{t("actions")}</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((v) => (
                <tr key={v.id} className="transition hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                    <Link href={`/vehicles/${v.id}`} className="hover:text-brand-600 hover:underline">
                      {v.registration_number}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{v.name}</td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{v.type}</td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{v.max_load_capacity} kg</td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{v.region ?? "—"}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={v.status} />
                  </td>
                  {canWrite && (
                    <td className="px-4 py-3">
                      <VehicleActions vehicleId={v.id} status={v.status} />
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
