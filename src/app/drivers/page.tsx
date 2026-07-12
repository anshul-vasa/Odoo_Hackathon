import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/session-server";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { DriverForm } from "@/components/DriverForm";
import { BulkImportButton } from "@/components/BulkImportButton";
import { DriversTable } from "@/components/tables/DriversTable";
import { listDrivers } from "@/lib/repositories/drivers";
import { can } from "@/lib/rbac";

export default async function DriversPage() {
  const session = await getServerSession();
  if (!session) redirect("/login");

  const drivers = await listDrivers();
  const canWrite = can(session.role, "drivers", "write");

  return (
    <AppShell session={session}>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <PageHeader page="drivers" count={drivers.length} />
        {canWrite && (
          <div className="flex flex-wrap items-center gap-2">
            <BulkImportButton
              label="Bulk Import"
              endpoint="/api/drivers/bulk-import"
              templateHeaders={["name", "licenseNumber", "licenseCategory", "licenseExpiryDate", "contactNumber", "safetyScore"]}
              templateSampleRow={["Rahul Sharma", "DL-9001", "LMV", "2027-01-01", "9876543210", 90]}
              templateFilename="drivers-import-template"
            />
            <DriverForm />
          </div>
        )}
      </div>

      <DriversTable drivers={drivers} canWrite={canWrite} />
    </AppShell>
  );
}
