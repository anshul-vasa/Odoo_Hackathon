"use client";

import { useLanguage } from "@/lib/i18n/context";

type PageHeaderProps =
  | { page: "vehicles"; count: number }
  | { page: "drivers"; count: number }
  | { page: "trips"; count: number }
  | { page: "maintenance"; count: number }
  | { page: "fuelExpenses"; fuelTotal: number; expenseTotal: number }
  | { page: "reports"; utilization: number };

// Centralizes the translated title + subtitle for every list/report page.
// Lives as a small client component (not the page itself) so the parent
// page can stay a server component doing the actual data fetching, and only
// this thin header needs the language context.
export function PageHeader(props: PageHeaderProps) {
  const { t } = useLanguage();

  let title: string;
  let subtitle: React.ReactNode;

  switch (props.page) {
    case "vehicles":
      title = t("vehicleRegistry");
      subtitle = `${t("vehicleRegistrySubtitle")} — ${props.count} ${t("total")}.`;
      break;
    case "drivers":
      title = t("driverManagement");
      subtitle = `${t("driverManagementSubtitle")} — ${props.count} ${t("total")}.`;
      break;
    case "trips":
      title = t("tripManagementTitle");
      subtitle = `${t("tripManagementSubtitle")} — ${props.count} ${t("total")}.`;
      break;
    case "maintenance":
      title = t("maintenanceLabel");
      subtitle = `${props.count} ${t("recordsAcrossFleet")}.`;
      break;
    case "fuelExpenses":
      title = t("fuelExpenses");
      subtitle = `${t("totalFuel")}: ₹${props.fuelTotal.toLocaleString("en-IN")} · ${t(
        "totalOtherExpenses"
      )}: ₹${props.expenseTotal.toLocaleString("en-IN")}`;
      break;
    case "reports":
      title = t("reportsAndAnalytics");
      subtitle = (
        <>
          {t("fleetUtilization")}:{" "}
          <span className="font-semibold text-slate-700 dark:text-slate-200">{props.utilization}%</span>
        </>
      );
      break;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{title}</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
    </div>
  );
}
