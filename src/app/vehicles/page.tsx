import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/session-server";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { VehicleForm } from "@/components/VehicleForm";
import { BulkImportButton } from "@/components/BulkImportButton";
import { VehiclesTable } from "@/components/tables/VehiclesTable";
import { listVehicles } from "@/lib/repositories/vehicles";
import { can } from "@/lib/rbac";

export default async function VehiclesPage() {
  const session = await getServerSession();
  if (!session) redirect("/login");

  const vehicles = await listVehicles();
  const canWrite = can(session.role, "vehicles", "write");

  return (
    <AppShell session={session}>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <PageHeader page="vehicles" count={vehicles.length} />
        {canWrite && (
          <div className="flex flex-wrap items-center gap-2">
            <BulkImportButton
              label="Bulk Import"
              endpoint="/api/vehicles/bulk-import"
              templateHeaders={["registrationNumber", "name", "type", "maxLoadCapacity", "acquisitionCost", "region", "chassisNumber", "insuranceExpiry", "pucExpiry"]}
              templateSampleRow={["GJ-01-AB-1234", "Van 131", "Van", 500, 250000, "Ahmedabad", "CHS-0001", "2027-01-01", "2027-01-01"]}
              templateFilename="vehicles-import-template"
            />
            <VehicleForm />
          </div>
        )}
      </div>

      <VehiclesTable vehicles={vehicles} canWrite={canWrite} />
    </AppShell>
  );
}
