"use client";

import { ShieldAlert, Clock } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import { ExpiryAlerts } from "@/components/ExpiryAlerts";
import { SimpleBarChart, SimplePie } from "@/components/DashboardCharts";
import { getExpiringLicenses, getExpiringVehicleDocs } from "@/lib/expiry";
import type { Driver, Vehicle } from "@/lib/types";

// Safety Officer gets a "compliance watchlist" layout: a horizontal stat
// strip (not a KPI grid) built around the average safety score as the hero
// number, then a narrow charts column next to a wide, avatar-style watchlist
// of suspended drivers — deliberately unlike the Fleet Manager's grid+rail.
export function SafetyOfficerDashboard({
  drivers,
  vehicles,
}: {
  drivers: Driver[];
  vehicles: Vehicle[];
}) {
  const { t } = useLanguage();
  const suspended = drivers.filter((d) => d.status === "SUSPENDED");
  const avgScore =
    drivers.length > 0
      ? Math.round(drivers.reduce((s, d) => s + d.safety_score, 0) / drivers.length)
      : 0;
  const scoreColor = avgScore >= 80 ? "text-green-600 dark:text-green-400" : avgScore >= 60 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400";

  const now = Date.now();
  const buckets = [
    { label: "0–50", min: 0, max: 50 },
    { label: "51–70", min: 51, max: 70 },
    { label: "71–85", min: 71, max: 85 },
    { label: "86–100", min: 86, max: 100 },
  ];
  const scoreData = buckets.map((b) => ({
    range: b.label,
    drivers: drivers.filter((d) => d.safety_score >= b.min && d.safety_score <= b.max).length,
  }));

  let valid = 0,
    expiringSoon = 0,
    expired = 0;
  for (const d of drivers) {
    const days = Math.ceil((new Date(d.license_expiry_date).getTime() - now) / (24 * 3600 * 1000));
    if (days < 0) expired++;
    else if (days <= 30) expiringSoon++;
    else valid++;
  }

  const expiringItems = [...getExpiringLicenses(drivers), ...getExpiringVehicleDocs(vehicles)];

  function initials(name: string) {
    return name
      .split(" ")
      .slice(0, 2)
      .map((p) => p.charAt(0))
      .join("")
      .toUpperCase();
  }

  return (
    <>
      <ExpiryAlerts items={expiringItems} title={t("complianceItemsExpiringSoon")} />

      <div className="flex flex-wrap items-stretch gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-card dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-1 min-w-[140px] flex-col items-center justify-center border-r border-slate-100 pr-4 dark:border-slate-800 last:border-0">
          <p className={`text-4xl font-bold ${scoreColor}`}>{avgScore}</p>
          <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{t("average")} {t("safetyScore")}</p>
        </div>
        <div className="flex flex-1 min-w-[140px] flex-col items-center justify-center border-r border-slate-100 pr-4 dark:border-slate-800 last:border-0">
          <p className="text-4xl font-bold text-slate-900 dark:text-white">{drivers.length}</p>
          <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{t("totalDrivers")}</p>
        </div>
        <div className="flex flex-1 min-w-[140px] flex-col items-center justify-center border-r border-slate-100 pr-4 dark:border-slate-800 last:border-0">
          <p className="text-4xl font-bold text-red-600 dark:text-red-400">{suspended.length}</p>
          <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{t("suspendedLabel")}</p>
        </div>
        <div className="flex flex-1 min-w-[140px] flex-col items-center justify-center">
          <p className="text-4xl font-bold text-amber-600 dark:text-amber-400">{expiringSoon + expired}</p>
          <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{t("licensesFlagged")}</p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[280px_1fr]">
        <div className="space-y-5">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">{t("safetyScoreSpread")}</h2>
            <SimpleBarChart data={scoreData} xKey="range" yKey="drivers" color="#8b5cf6" />
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">{t("licenseStatus")}</h2>
            <SimplePie
              data={[
                { name: "Valid", value: valid },
                { name: "Expiring ≤30d", value: expiringSoon },
                { name: "Expired", value: expired },
              ]}
              colors={["#22c55e", "#f59e0b", "#ef4444"]}
            />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white shadow-card dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3 dark:border-slate-800">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
              <ShieldAlert size={16} className="text-red-500" /> {t("suspendedWatchlist")}
            </h2>
            <a href="/drivers" className="text-xs font-medium text-brand-600 hover:underline dark:text-brand-400">
              {t("manageDriversAction")}
            </a>
          </div>
          {suspended.length === 0 ? (
            <p className="flex items-center gap-2 px-5 py-8 text-sm text-slate-400">
              <Clock size={16} /> {t("noSuspendedDrivers")}
            </p>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {suspended.map((d) => (
                <li key={d.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-sm font-semibold text-red-700 dark:bg-red-950 dark:text-red-300">
                    {initials(d.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{d.name}</p>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                      {d.license_number} · {d.license_category} · score {d.safety_score}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
