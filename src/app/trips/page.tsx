import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/session-server";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { TripForm } from "@/components/TripForm";
import { TripsTable, type TripRowData } from "@/components/tables/TripsTable";
import { listTrips } from "@/lib/repositories/trips";
import { listVehicles, getVehicleById } from "@/lib/repositories/vehicles";
import { listDrivers, getDriverById, isLicenseExpired } from "@/lib/repositories/drivers";
import { can } from "@/lib/rbac";

export default async function TripsPage() {
  const session = await getServerSession();
  if (!session) redirect("/login");

  const trips = listTrips();
  const vehicles = listVehicles({ status: "AVAILABLE" });
  const drivers = listDrivers({ status: "AVAILABLE" }).filter(
    (d) => !isLicenseExpired(d)
  );
  const canWrite = can(session.role, "trips", "write");

  const tripRows: TripRowData[] = trips.map((t) => {
    const vehicle = getVehicleById(t.vehicle_id);
    const driver = getDriverById(t.driver_id);
    return {
      id: t.id,
      source: t.source,
      destination: t.destination,
      vehicleReg: vehicle?.registration_number ?? "—",
      driverName: driver?.name ?? "—",
      cargo_weight: t.cargo_weight,
      planned_distance: t.planned_distance,
      actual_distance: t.actual_distance,
      status: t.status,
      created_at: t.created_at,
    };
  });

  return (
    <AppShell session={session}>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <PageHeader page="trips" count={trips.length} />
        {canWrite && <TripForm vehicles={vehicles} drivers={drivers} />}
      </div>

      <TripsTable trips={tripRows} canWrite={canWrite} />
    </AppShell>
  );
}
