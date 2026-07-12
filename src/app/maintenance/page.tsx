import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/session-server";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { MaintenanceForm } from "@/components/MaintenanceForm";
import { MaintenanceTable, type MaintenanceRowData } from "@/components/tables/MaintenanceTable";
import { listMaintenanceRecords } from "@/lib/repositories/maintenance";
import { listVehicles } from "@/lib/repositories/vehicles";
import { can } from "@/lib/rbac";

export default async function MaintenancePage() {
  const session = await getServerSession();
  if (!session) redirect("/login");

  const records = await listMaintenanceRecords();
  const allVehicles = await listVehicles();
  const eligibleVehicles = allVehicles.filter(
    (v) => v.status !== "ON_TRIP" && v.status !== "RETIRED"
  );
  const canWrite = can(session.role, "maintenance", "write");

  const vehicleRegById = new Map<string, string>();
  for (const v of allVehicles) vehicleRegById.set(v.id, v.registration_number);

  const rows: MaintenanceRowData[] = records.map((r) => ({
    id: r.id,
    vehicleReg: vehicleRegById.get(r.vehicle_id) ?? "—",
    description: r.description,
    cost: r.cost,
    created_at: r.created_at,
    closed_at: r.closed_at,
    status: r.status,
  }));

  return (
    <AppShell session={session}>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <PageHeader page="maintenance" count={records.length} />
        {canWrite && <MaintenanceForm vehicles={eligibleVehicles} />}
      </div>

      <MaintenanceTable records={rows} canWrite={canWrite} />
    </AppShell>
  );
}
