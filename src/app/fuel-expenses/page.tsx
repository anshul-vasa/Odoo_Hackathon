import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/session-server";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { FuelLogForm } from "@/components/FuelLogForm";
import { ExpenseForm } from "@/components/ExpenseForm";
import { listFuelLogs } from "@/lib/repositories/fuel";
import { listExpenses } from "@/lib/repositories/expenses";
import { listVehicles, getVehicleById } from "@/lib/repositories/vehicles";
import { can } from "@/lib/rbac";

export default async function FuelExpensesPage() {
  const session = await getServerSession();
  if (!session) redirect("/login");

  const fuelLogs = listFuelLogs();
  const expenses = listExpenses();
  const vehicles = listVehicles({ status: undefined });
  const canWrite = can(session.role, "fuel", "write");

  const totalFuelCost = fuelLogs.reduce((s, f) => s + f.cost, 0);
  const totalExpenseCost = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <AppShell session={session}>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <PageHeader page="fuelExpenses" fuelTotal={totalFuelCost} expenseTotal={totalExpenseCost} />
        {canWrite && (
          <div className="flex gap-2">
            <FuelLogForm vehicles={vehicles} />
            <ExpenseForm vehicles={vehicles} />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <h2 className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">Fuel Logs</h2>
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card dark:border-slate-800 dark:bg-slate-900">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
                  <tr>
                    <th className="px-4 py-3">Vehicle</th>
                    <th className="px-4 py-3">Liters</th>
                    <th className="px-4 py-3">Cost</th>
                    <th className="px-4 py-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {fuelLogs.map((f) => (
                    <tr key={f.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                        {getVehicleById(f.vehicle_id)?.registration_number ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{f.liters} L</td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300">₹{f.cost.toLocaleString()}</td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{f.date.slice(0, 10)}</td>
                    </tr>
                  ))}
                  {fuelLogs.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-10 text-center text-slate-400">
                        No fuel logs yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div>
          <h2 className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">Other Expenses</h2>
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card dark:border-slate-800 dark:bg-slate-900">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
                  <tr>
                    <th className="px-4 py-3">Vehicle</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {expenses.map((e) => (
                    <tr key={e.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                        {getVehicleById(e.vehicle_id)?.registration_number ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{e.type}</td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300">₹{e.amount.toLocaleString()}</td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{e.date.slice(0, 10)}</td>
                    </tr>
                  ))}
                  {expenses.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-10 text-center text-slate-400">
                        No expenses logged yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
