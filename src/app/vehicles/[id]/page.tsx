import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getServerSession } from "@/lib/session-server";
import { AppShell } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { VehicleDetailTabs } from "@/components/VehicleDetailTabs";
import { getVehicleById } from "@/lib/repositories/vehicles";
import { listMaintenanceRecords } from "@/lib/repositories/maintenance";
import { listTrips } from "@/lib/repositories/trips";
import { listFuelLogs } from "@/lib/repositories/fuel";
import { listExpenses } from "@/lib/repositories/expenses";

export default async function VehicleDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession();
  if (!session) redirect("/login");

  const vehicle = getVehicleById(params.id);
  if (!vehicle) notFound();

  const maintenance = listMaintenanceRecords(vehicle.id);
  const trips = listTrips({ vehicleId: vehicle.id });
  const fuelLogs = listFuelLogs(vehicle.id);
  const expenses = listExpenses(vehicle.id);

  return (
    <AppShell session={session}>
      <Link
        href="/vehicles"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
      >
        <ArrowLeft size={15} /> Back to Vehicles
      </Link>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {vehicle.registration_number}
            </h1>
            <StatusBadge status={vehicle.status} />
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {vehicle.name} · {vehicle.type}
          </p>
        </div>
      </div>

      <VehicleDetailTabs
        vehicle={vehicle}
        maintenance={maintenance}
        trips={trips}
        fuelLogs={fuelLogs}
        expenses={expenses}
      />
    </AppShell>
  );
}
