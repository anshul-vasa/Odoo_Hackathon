"use client";

import { Fuel, Wrench, Receipt, TrendingDown, ArrowUpRight } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import { SimpleBarChart, SimplePie } from "@/components/DashboardCharts";
import type { Vehicle, FuelLog, Expense, MaintenanceRecord } from "@/lib/types";

// Financial Analyst gets a "statement" layout: a dark hero card carrying the
// headline number (like a bank app's balance card) with a lighter breakdown
// row inside it, then a ledger-style two-column body below — visually
// distinct from the light KPI-grid look the other three roles use.
export function FinancialAnalystDashboard({
  vehicles,
  fuelLogs,
  expenses,
  maintenanceRecords,
}: {
  vehicles: Vehicle[];
  fuelLogs: FuelLog[];
  expenses: Expense[];
  maintenanceRecords: MaintenanceRecord[];
}) {
  const { t } = useLanguage();
  const totalFuelCost = fuelLogs.reduce((s, f) => s + f.cost, 0);
  const totalExpenseCost = expenses.reduce((s, e) => s + e.amount, 0);
  const totalMaintenanceCost = maintenanceRecords.reduce((s, m) => s + m.cost, 0);
  const totalOperationalCost = totalFuelCost + totalExpenseCost + totalMaintenanceCost;
  const totalAcquisitionCost = vehicles.reduce((s, v) => s + v.acquisition_cost, 0);
  const costRecoveryRatio =
    totalAcquisitionCost > 0
      ? Math.round((-totalOperationalCost / totalAcquisitionCost) * 100 * 10) / 10
      : 0;

  const costByVehicle = vehicles
    .map((v) => {
      const fuel = fuelLogs.filter((f) => f.vehicle_id === v.id).reduce((s, f) => s + f.cost, 0);
      const maint = maintenanceRecords
        .filter((m) => m.vehicle_id === v.id)
        .reduce((s, m) => s + m.cost, 0);
      const exp = expenses.filter((e) => e.vehicle_id === v.id).reduce((s, e) => s + e.amount, 0);
      return { name: v.registration_number, cost: Math.round(fuel + maint + exp) };
    })
    .sort((a, b) => b.cost - a.cost)
    .slice(0, 8);

  const rupee = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

  return (
    <>
      <div className="rounded-xl bg-slate-900 p-6 text-white shadow-card dark:bg-slate-950 dark:ring-1 dark:ring-slate-800">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
          {t("totalOperationalCost")}
        </p>
        <p className="mt-1 text-4xl font-bold">{rupee(totalOperationalCost)}</p>

        <div className="mt-5 grid grid-cols-1 gap-3 border-t border-white/10 pt-4 sm:grid-cols-3">
          <div className="flex items-center gap-2.5">
            <Fuel size={16} className="text-blue-400" />
            <div>
              <p className="text-sm font-semibold">{rupee(totalFuelCost)}</p>
              <p className="text-xs text-slate-400">{t("fuelLabel")}</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <Wrench size={16} className="text-amber-400" />
            <div>
              <p className="text-sm font-semibold">{rupee(totalMaintenanceCost)}</p>
              <p className="text-xs text-slate-400">{t("maintenanceLabel")}</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <Receipt size={16} className="text-purple-400" />
            <div>
              <p className="text-sm font-semibold">{rupee(totalExpenseCost)}</p>
              <p className="text-xs text-slate-400">{t("otherExpenses")}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">{t("topCostVehicles")}</h2>
          <SimpleBarChart data={costByVehicle} xKey="name" yKey="cost" color="#f59e0b" />
        </div>

        <div className="space-y-5">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">{t("costBreakdown")}</h2>
            <SimplePie
              data={[
                { name: "Fuel", value: Math.round(totalFuelCost) },
                { name: "Maintenance", value: Math.round(totalMaintenanceCost) },
                { name: "Other", value: Math.round(totalExpenseCost) },
              ]}
              colors={["#3b82f6", "#f59e0b", "#8b5cf6"]}
            />
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2">
              <TrendingDown size={16} className="text-slate-500 dark:text-slate-400" />
              <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">{t("costRecoveryRatio")}</h2>
            </div>
            <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{costRecoveryRatio}%</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Operational cost as a share of acquisition cost — a stand-in for true ROI
              since per-trip revenue isn&rsquo;t tracked. Full methodology on Reports.
            </p>
            <a href="/reports" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:underline dark:text-brand-400">
              {t("openFullReports")} <ArrowUpRight size={13} />
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
