import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/session-server";
import { AppShell } from "@/components/AppShell";
import { listVehicles } from "@/lib/repositories/vehicles";
import { listDrivers } from "@/lib/repositories/drivers";
import { listTrips } from "@/lib/repositories/trips";
import { listFuelLogs } from "@/lib/repositories/fuel";
import { listExpenses } from "@/lib/repositories/expenses";
import { listMaintenanceRecords } from "@/lib/repositories/maintenance";
import { FleetManagerDashboard } from "@/components/dashboards/FleetManagerDashboard";
import { SafetyOfficerDashboard } from "@/components/dashboards/SafetyOfficerDashboard";
import { FinancialAnalystDashboard } from "@/components/dashboards/FinancialAnalystDashboard";
import { DriverDashboard } from "@/components/dashboards/DriverDashboard";

export default async function DashboardPage() {
  const session = await getServerSession();
  if (!session) redirect("/login");

  const vehicles = listVehicles();
  const drivers = listDrivers();
  const trips = listTrips();

  return (
    <AppShell session={session}>
      {session.role === "FLEET_MANAGER" && (
        <FleetManagerDashboard vehicles={vehicles} drivers={drivers} trips={trips} />
      )}

      {session.role === "SAFETY_OFFICER" && (
        <SafetyOfficerDashboard drivers={drivers} vehicles={vehicles} />
      )}

      {session.role === "FINANCIAL_ANALYST" && (
        <FinancialAnalystDashboard
          vehicles={vehicles}
          fuelLogs={listFuelLogs()}
          expenses={listExpenses()}
          maintenanceRecords={listMaintenanceRecords()}
        />
      )}

      {session.role === "DRIVER" && <DriverDashboard trips={trips} />}
    </AppShell>
  );
}
