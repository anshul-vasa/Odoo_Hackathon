"use client";

import { useState } from "react";
import { StatusBadge } from "@/components/StatusBadge";
import { TripActions } from "@/components/TripActions";
import { InvoiceBilling } from "@/components/trips/InvoiceBilling";
import { VehicleCompliance } from "@/components/trips/VehicleCompliance";
import { WeatherRouteAdvisory } from "@/components/trips/WeatherRouteAdvisory";
import type { Trip, Vehicle, Driver, Invoice, Challan } from "@/lib/types";

const TABS = ["Overview", "Billing & GST", "Vehicle Compliance", "Weather & Route"] as const;
type Tab = (typeof TABS)[number];

function InfoCard({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{value}</p>
    </div>
  );
}

export function TripDetailTabs({
  trip,
  vehicle,
  driver,
  invoice,
  challans,
  canWriteTrips,
  canWriteVehicles,
}: {
  trip: Trip;
  vehicle: Vehicle | undefined;
  driver: Driver | undefined;
  invoice: Invoice | null;
  challans: Challan[];
  canWriteTrips: boolean;
  canWriteVehicles: boolean;
}) {
  const [tab, setTab] = useState<Tab>("Overview");

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
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <InfoCard label="Vehicle" value={vehicle?.registration_number ?? "—"} />
            <InfoCard label="Driver" value={driver?.name ?? "—"} />
            <InfoCard label="Cargo Weight" value={`${trip.cargo_weight} kg`} />
            <InfoCard
              label="Distance"
              value={`${trip.planned_distance} km planned${trip.actual_distance != null ? ` / ${trip.actual_distance} km actual` : ""}`}
            />
          </div>
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-card dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3">
              <StatusBadge status={trip.status} />
              <span className="text-sm text-slate-500 dark:text-slate-400">
                Created {trip.created_at.slice(0, 10)}
                {trip.dispatched_at ? ` · Dispatched ${trip.dispatched_at.slice(0, 10)}` : ""}
                {trip.completed_at ? ` · Completed ${trip.completed_at.slice(0, 10)}` : ""}
                {trip.cancelled_at ? ` · Cancelled ${trip.cancelled_at.slice(0, 10)}` : ""}
              </span>
            </div>
            {canWriteTrips && <TripActions tripId={trip.id} status={trip.status} />}
          </div>
        </div>
      )}

      {tab === "Billing & GST" && <InvoiceBilling trip={trip} invoice={invoice} canWrite={canWriteTrips} />}

      {tab === "Vehicle Compliance" &&
        (vehicle ? (
          <VehicleCompliance vehicle={vehicle} challans={challans} canWrite={canWriteVehicles} />
        ) : (
          <p className="text-sm text-slate-400">Vehicle information unavailable.</p>
        ))}

      {tab === "Weather & Route" && (
        <WeatherRouteAdvisory tripId={trip.id} source={trip.source} destination={trip.destination} />
      )}
    </div>
  );
}
