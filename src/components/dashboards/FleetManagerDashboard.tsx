"use client";

import { Truck, CheckCircle2, Wrench, Route, Users, ArrowRight } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import { KpiCard } from "@/components/KpiCard";
import { ExpiryAlerts } from "@/components/ExpiryAlerts";
import { VehicleStatusPie, TripsBarChart } from "@/components/DashboardCharts";
import { getExpiringLicenses, getExpiringVehicleDocs } from "@/lib/expiry";
import type { Vehicle, Driver, Trip } from "@/lib/types";

// Fleet Manager gets the "operations command centre" layout: a wide working
// area for the numbers that change hour to hour, plus a narrow fixed rail on
// the right for utilization + where-to-go-next — the two things a fleet
// manager glances at without needing to read a full report.
export function FleetManagerDashboard({
  vehicles,
  drivers,
  trips,
}: {
  vehicles: Vehicle[];
  drivers: Driver[];
  trips: Trip[];
}) {
  const { t } = useLanguage();
  const activeVehicles = vehicles.filter((v) => v.status !== "RETIRED").length;
  const availableVehicles = vehicles.filter((v) => v.status === "AVAILABLE").length;
  const inMaintenance = vehicles.filter((v) => v.status === "IN_SHOP").length;
  const onTripVehicles = vehicles.filter((v) => v.status === "ON_TRIP").length;
  const retiredVehicles = vehicles.filter((v) => v.status === "RETIRED").length;
  const activeTrips = trips.filter((t) => t.status === "DISPATCHED").length;
  const pendingTrips = trips.filter((t) => t.status === "DRAFT").length;
  const driversOnDuty = drivers.filter((d) => d.status === "ON_TRIP").length;
  const utilization = activeVehicles > 0 ? Math.round((onTripVehicles / activeVehicles) * 100) : 0;

  const statusPieData = [
    { name: "Available", value: availableVehicles },
    { name: "On Trip", value: onTripVehicles },
    { name: "In Shop", value: inMaintenance },
    { name: "Retired", value: retiredVehicles },
  ];

  const days: { day: string; trips: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString("en-IN", { weekday: "short" });
    const count = trips.filter((t) => t.created_at.slice(0, 10) === key).length;
    days.push({ day: label, trips: count });
  }

  const expiringItems = [...getExpiringVehicleDocs(vehicles), ...getExpiringLicenses(drivers)];
  const needsAttention = vehicles.filter((v) => v.status === "IN_SHOP").slice(0, 5);

  const quickLinks = [
    { href: "/vehicles", label: t("manageVehiclesAction"), icon: Truck },
    { href: "/drivers", label: t("manageDriversAction"), icon: Users },
    { href: "/trips", label: t("tripManagementTitle"), icon: Route },
  ];

  return (
    <>
      <ExpiryAlerts items={expiringItems} title={t("documentsExpiringSoon")} />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_300px]">
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <KpiCard label={t("activeVehicles")} value={activeVehicles} icon={Truck} tint="bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300" />
            <KpiCard label={t("availableVehicles")} value={availableVehicles} icon={CheckCircle2} tint="bg-green-50 text-green-600 dark:bg-green-900/40 dark:text-green-300" />
            <KpiCard label={t("inMaintenance")} value={inMaintenance} icon={Wrench} tint="bg-amber-50 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300" />
            <KpiCard label={t("driversOnDuty")} value={driversOnDuty} icon={Users} tint="bg-purple-50 text-purple-600 dark:bg-purple-900/40 dark:text-purple-300" />
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">{t("tripsLast7Days")}</h2>
              <span className="text-xs text-slate-400">
                {activeTrips} {t("active")} · {pendingTrips} {t("pending")}
              </span>
            </div>
            <TripsBarChart data={days} />
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-xl bg-brand-600 p-5 text-white shadow-card">
            <p className="text-xs font-medium uppercase tracking-wide text-brand-100">{t("fleetUtilization")}</p>
            <p className="mt-1 text-4xl font-bold">{utilization}%</p>
            <p className="mt-1 text-xs text-brand-100">{onTripVehicles} of {activeVehicles} active vehicles on a trip right now</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">{t("fleetStatus")}</h2>
            <VehicleStatusPie data={statusPieData} />
          </div>

          {needsAttention.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-card dark:border-slate-800 dark:bg-slate-900">
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {t("inTheShop")}
              </h2>
              <ul className="space-y-1.5">
                {needsAttention.map((v) => (
                  <li key={v.id} className="flex items-center justify-between text-sm">
                    <span className="text-slate-700 dark:text-slate-300">{v.registration_number}</span>
                    <a href={`/vehicles/${v.id}`} className="text-xs font-medium text-brand-600 hover:underline dark:text-brand-400">
                      {t("view")}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <nav className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card dark:border-slate-800 dark:bg-slate-900">
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  className="flex items-center justify-between border-b border-slate-100 px-4 py-3 text-sm font-medium text-slate-700 last:border-0 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-800/60"
                >
                  <span className="flex items-center gap-2.5">
                    <Icon size={16} className="text-slate-400" />
                    {link.label}
                  </span>
                  <ArrowRight size={14} className="text-slate-300" />
                </a>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
}
