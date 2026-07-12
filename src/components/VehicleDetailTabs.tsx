"use client";

import { useState } from "react";
import { StatusBadge } from "@/components/StatusBadge";
import type { Vehicle, MaintenanceRecord, Trip, FuelLog, Expense } from "@/lib/types";

const TABS = ["Overview", "Maintenance", "Trips", "Fuel & Expenses"] as const;
type Tab = (typeof TABS)[number];

export function VehicleDetailTabs({
  vehicle,
  maintenance,
  trips,
  fuelLogs,
  expenses,
}: {
  vehicle: Vehicle;
  maintenance: MaintenanceRecord[];
  trips: Trip[];
  fuelLogs: FuelLog[];
  expenses: Expense[];
}) {
  const [tab, setTab] = useState<Tab>("Overview");

  const totalFuelCost = fuelLogs.reduce((s, f) => s + f.cost, 0);
  const totalExpenseCost = expenses.reduce((s, e) => s + e.amount, 0);
  const totalMaintenanceCost = maintenance.reduce((s, m) => s + m.cost, 0);

  return (
    <div>
      <div className="mb-6 flex gap-1 overflow-x-auto border-b border-slate-200 dark:border-slate-800">
        {TABS.map((tabName) => (
          <button
            key={tabName}
            onClick={() => setTab(tabName)}
            className={`whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
              tab === tabName
                ? "border-brand-600 text-brand-700 dark:text-brand-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            {tabName}
          </button>
        ))}
      </div>

      {tab === "Overview" && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <InfoCard label="Max Load Capacity" value={`${vehicle.max_load_capacity} kg`} />
          <InfoCard label="Odometer" value={`${vehicle.odometer.toLocaleString()} km`} />
          <InfoCard label="Acquisition Cost" value={`₹${vehicle.acquisition_cost.toLocaleString()}`} />
          <InfoCard label="City / Region" value={vehicle.region ?? "—"} />
          <InfoCard label="Chassis Number" value={vehicle.chassis_number ?? "—"} />
          <InfoCard
            label="Insurance Expiry"
            value={vehicle.insurance_expiry ? vehicle.insurance_expiry.slice(0, 10) : "—"}
          />
          <InfoCard
            label="PUC Expiry"
            value={vehicle.puc_expiry ? vehicle.puc_expiry.slice(0, 10) : "—"}
          />
          <InfoCard label="Total Fuel Cost" value={`₹${totalFuelCost.toLocaleString()}`} />
          <InfoCard label="Total Maintenance Cost" value={`₹${totalMaintenanceCost.toLocaleString()}`} />
          <InfoCard label="Other Expenses" value={`₹${totalExpenseCost.toLocaleString()}`} />
        </div>
      )}

      {tab === "Maintenance" && (
        <Table
          headers={["Description", "Cost", "Status", "Opened", "Closed"]}
          rows={maintenance.map((m) => [
            m.description,
            `₹${m.cost.toLocaleString()}`,
            <StatusBadge key="s" status={m.status} />,
            m.created_at.slice(0, 10),
            m.closed_at ? m.closed_at.slice(0, 10) : "—",
          ])}
          empty="No maintenance records for this vehicle yet."
        />
      )}

      {tab === "Trips" && (
        <Table
          headers={["Route", "Cargo", "Distance", "Status", "Date"]}
          rows={trips.map((t) => [
            `${t.source} → ${t.destination}`,
            `${t.cargo_weight} kg`,
            `${t.planned_distance} km${t.actual_distance != null ? ` / ${t.actual_distance} km` : ""}`,
            <StatusBadge key="s" status={t.status} />,
            t.created_at.slice(0, 10),
          ])}
          empty="No trips for this vehicle yet."
        />
      )}

      {tab === "Fuel & Expenses" && (
        <div className="space-y-6">
          <Table
            headers={["Liters", "Cost", "Date"]}
            rows={fuelLogs.map((f) => [`${f.liters} L`, `₹${f.cost.toLocaleString()}`, f.date.slice(0, 10)])}
            empty="No fuel logs for this vehicle yet."
          />
          <Table
            headers={["Type", "Amount", "Description", "Date"]}
            rows={expenses.map((e) => [
              e.type,
              `₹${e.amount.toLocaleString()}`,
              e.description ?? "—",
              e.date.slice(0, 10),
            ])}
            empty="No other expenses for this vehicle yet."
          />
        </div>
      )}
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-card dark:border-slate-800 dark:bg-slate-900">
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">{value}</p>
    </div>
  );
}

function Table({
  headers,
  rows,
  empty,
}: {
  headers: string[];
  rows: React.ReactNode[][];
  empty: string;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card dark:border-slate-800 dark:bg-slate-900">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
            <tr>
              {headers.map((h) => (
                <th key={h} className="px-4 py-3">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {rows.map((row, i) => (
              <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                {row.map((cell, j) => (
                  <td key={j} className="px-4 py-3 text-slate-700 dark:text-slate-300">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={headers.length} className="px-4 py-10 text-center text-slate-400">
                  {empty}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
