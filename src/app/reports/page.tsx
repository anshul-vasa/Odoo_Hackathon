import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/session-server";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { ExportButtons } from "@/components/ExportButtons";
import { TrendLineChart } from "@/components/DashboardCharts";
import { listVehicles } from "@/lib/repositories/vehicles";
import { listTrips } from "@/lib/repositories/trips";
import { listFuelLogs } from "@/lib/repositories/fuel";
import { listExpenses } from "@/lib/repositories/expenses";
import { listMaintenanceRecords } from "@/lib/repositories/maintenance";

export default async function ReportsPage() {
  const session = await getServerSession();
  if (!session) redirect("/login");

  const vehicles = listVehicles();
  const allTrips = listTrips();
  const allFuel = listFuelLogs();
  const allExpenses = listExpenses();
  const allMaintenance = listMaintenanceRecords();

  const activeVehicles = vehicles.filter((v) => v.status !== "RETIRED").length;
  const onTripVehicles = vehicles.filter((v) => v.status === "ON_TRIP").length;
  const fleetUtilization =
    activeVehicles > 0 ? Math.round((onTripVehicles / activeVehicles) * 100) : 0;

  // 30-day trend: daily distance covered (completed trips) vs. daily
  // operational cost (fuel + maintenance + other expenses), for the Reports
  // trend chart below.
  const trendDays: { key: string; label: string }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    trendDays.push({ key: d.toISOString().slice(0, 10), label: d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) });
  }
  const trendData = trendDays.map(({ key, label }) => {
    const distance = allTrips
      .filter((t) => t.status === "COMPLETED" && (t.completed_at ?? "").slice(0, 10) === key)
      .reduce((s, t) => s + (t.actual_distance ?? 0), 0);
    const fuelCostDay = allFuel.filter((f) => f.date.slice(0, 10) === key).reduce((s, f) => s + f.cost, 0);
    const maintenanceCostDay = allMaintenance
      .filter((m) => m.created_at.slice(0, 10) === key)
      .reduce((s, m) => s + m.cost, 0);
    const expenseCostDay = allExpenses.filter((e) => e.date.slice(0, 10) === key).reduce((s, e) => s + e.amount, 0);
    return {
      day: label,
      distance: Math.round(distance),
      cost: Math.round(fuelCostDay + maintenanceCostDay + expenseCostDay),
    };
  });

  const rows = vehicles.map((v) => {
    const trips = allTrips.filter((t) => t.vehicle_id === v.id && t.status === "COMPLETED");
    const distance = trips.reduce((s, t) => s + (t.actual_distance ?? 0), 0);
    const fuelLogs = allFuel.filter((f) => f.vehicle_id === v.id);
    const fuelLiters = fuelLogs.reduce((s, f) => s + f.liters, 0);
    const fuelCost = fuelLogs.reduce((s, f) => s + f.cost, 0);
    const maintenanceCost = allMaintenance
      .filter((m) => m.vehicle_id === v.id)
      .reduce((s, m) => s + m.cost, 0);
    const otherExpenses = allExpenses
      .filter((e) => e.vehicle_id === v.id)
      .reduce((s, e) => s + e.amount, 0);
    const operationalCost = fuelCost + maintenanceCost;
    const fuelEfficiency = fuelLiters > 0 ? distance / fuelLiters : 0;
    // Revenue isn't tracked in this build (no invoicing/billing in scope) — ROI is
    // shown as a cost-recovery ratio against acquisition cost until real revenue
    // per trip is wired in.
    const roi = v.acquisition_cost > 0 ? (-operationalCost / v.acquisition_cost) * 100 : 0;

    return {
      registration: v.registration_number,
      distance: Math.round(distance),
      fuelLiters: Math.round(fuelLiters * 10) / 10,
      fuelEfficiency: Math.round(fuelEfficiency * 10) / 10,
      fuelCost: Math.round(fuelCost),
      maintenanceCost: Math.round(maintenanceCost),
      otherExpenses: Math.round(otherExpenses),
      operationalCost: Math.round(operationalCost),
      roi: Math.round(roi * 10) / 10,
    };
  });

  const topCostByVehicle = [...rows]
    .sort((a, b) => b.operationalCost - a.operationalCost)
    .slice(0, 8)
    .map((r) => ({ name: r.registration, value: r.operationalCost }));

  const distanceTrendForPdf = trendData.map((d) => ({ name: d.day, value: d.distance }));

  const headers = [
    "Vehicle",
    "Distance (km)",
    "Fuel (L)",
    "Fuel Efficiency (km/L)",
    "Fuel Cost (₹)",
    "Maintenance Cost (₹)",
    "Other Expenses (₹)",
    "Operational Cost (₹)",
    "ROI (%)",
  ];
  const exportRows = rows.map((r) => [
    r.registration,
    r.distance,
    r.fuelLiters,
    r.fuelEfficiency,
    r.fuelCost,
    r.maintenanceCost,
    r.otherExpenses,
    r.operationalCost,
    r.roi,
  ]);

  return (
    <AppShell session={session}>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
<PageHeader page="reports" utilization={fleetUtilization} />
        <ExportButtons
          filename="transitops-fleet-report"
          title="TransitOps — Fleet Report"
          headers={headers}
          rows={exportRows}
          barChart={{ label: "Top Operational Cost by Vehicle (Rs.)", data: topCostByVehicle, color: [245, 158, 11] }}
          lineChart={{ label: "Distance Covered — Last 30 Days (km)", data: distanceTrendForPdf, color: [59, 130, 246] }}
        />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
            Distance Covered — Last 30 Days
          </h2>
          <TrendLineChart
            data={trendData}
            xKey="day"
            lines={[{ key: "distance", label: "Distance (km)", color: "#3b82f6" }]}
          />
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
            Operational Cost — Last 30 Days
          </h2>
          <TrendLineChart
            data={trendData}
            xKey="day"
            lines={[{ key: "cost", label: "Cost (₹)", color: "#f59e0b" }]}
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
              <tr>
                {headers.map((h) => (
                  <th key={h} className="whitespace-nowrap px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {rows.map((r) => (
                <tr key={r.registration} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">{r.registration}</td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{r.distance.toLocaleString()}</td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{r.fuelLiters}</td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{r.fuelEfficiency || "—"}</td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300">₹{r.fuelCost.toLocaleString()}</td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300">₹{r.maintenanceCost.toLocaleString()}</td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300">₹{r.otherExpenses.toLocaleString()}</td>
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">₹{r.operationalCost.toLocaleString()}</td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{r.roi}%</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={headers.length} className="px-4 py-10 text-center text-slate-400">
                    No vehicles to report on yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="mt-4 text-xs text-slate-400">
        ROI is shown as a cost-recovery ratio against acquisition cost (revenue per
        trip isn&rsquo;t tracked in this build — plug in real billing data to get the
        spec&rsquo;s full Revenue − (Maintenance + Fuel) / Acquisition Cost formula).
      </p>
    </AppShell>
  );
}
