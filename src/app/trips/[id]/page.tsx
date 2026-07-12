import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getServerSession } from "@/lib/session-server";
import { AppShell } from "@/components/AppShell";
import { TripDetailTabs } from "@/components/trips/TripDetailTabs";
import { getTripById } from "@/lib/repositories/trips";
import { getVehicleById } from "@/lib/repositories/vehicles";
import { getDriverById } from "@/lib/repositories/drivers";
import { getInvoiceByTripId } from "@/lib/repositories/invoices";
import { listChallans } from "@/lib/repositories/challans";
import { can } from "@/lib/rbac";

export default async function TripDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession();
  if (!session) redirect("/login");

  const trip = await getTripById(params.id);
  if (!trip) notFound();

  const vehicle = await getVehicleById(trip.vehicle_id);
  const driver = await getDriverById(trip.driver_id);
  const invoice = await getInvoiceByTripId(trip.id) ?? null;
  const challans = vehicle ? await listChallans(vehicle.id) : [];

  return (
    <AppShell session={session}>
      <Link
        href="/trips"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
      >
        <ArrowLeft size={15} /> Back to Trips
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          {trip.source} → {trip.destination}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {vehicle?.registration_number ?? "—"} · {driver?.name ?? "—"}
        </p>
      </div>

      <TripDetailTabs
        trip={trip}
        vehicle={vehicle}
        driver={driver}
        invoice={invoice}
        challans={challans}
        canWriteTrips={can(session.role, "trips", "write")}
        canWriteVehicles={can(session.role, "vehicles", "write")}
      />
    </AppShell>
  );
}
