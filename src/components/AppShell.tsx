"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Truck,
  Users,
  Route,
  Wrench,
  Fuel,
  BarChart3,
  Menu,
  X,
} from "lucide-react";
import { LogoutButton } from "@/components/LogoutButton";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLanguage } from "@/lib/i18n/context";
import type { SessionPayload } from "@/lib/auth";
import { can } from "@/lib/rbac";

const ROLE_LABELS: Record<string, string> = {
  FLEET_MANAGER: "Fleet Manager",
  DRIVER: "Driver",
  SAFETY_OFFICER: "Safety Officer",
  FINANCIAL_ANALYST: "Financial Analyst",
};

function useNavItems() {
  const { t } = useLanguage();
  return [
    { href: "/dashboard", label: t("dashboard"), icon: LayoutDashboard, resource: "dashboard" as const },
    { href: "/vehicles", label: t("vehicles"), icon: Truck, resource: "vehicles" as const },
    { href: "/drivers", label: t("drivers"), icon: Users, resource: "drivers" as const },
    { href: "/trips", label: t("trips"), icon: Route, resource: "trips" as const },
    { href: "/maintenance", label: t("maintenance"), icon: Wrench, resource: "maintenance" as const },
    { href: "/fuel-expenses", label: t("fuelExpenses"), icon: Fuel, resource: "fuel" as const },
    { href: "/reports", label: t("reports"), icon: BarChart3, resource: "reports" as const },
  ];
}

export function AppShell({
  session,
  children,
}: {
  session: SessionPayload;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navItems = useNavItems();
  const visibleItems = navItems.filter((item) => can(session.role, item.resource, "read"));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Mobile top bar */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900 lg:hidden">
        <span className="text-lg font-bold text-slate-900 dark:text-white">TransitOps</span>
        <button onClick={() => setMobileOpen((o) => !o)} className="text-slate-600 dark:text-slate-300">
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`${
            mobileOpen ? "flex" : "hidden"
          } fixed inset-y-0 left-0 z-30 w-64 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 lg:sticky lg:top-0 lg:flex lg:h-screen`}
        >
          <div className="flex items-center gap-2 border-b border-slate-200 px-5 py-5 dark:border-slate-800">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
              TO
            </div>
            <div>
              <p className="text-base font-bold leading-tight text-slate-900 dark:text-white">
                TransitOps
              </p>
              <p className="text-xs text-slate-400">Smart Transport Ops</p>
            </div>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
            {visibleItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                    active
                      ? "bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300"
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`}
                >
                  <Icon size={18} strokeWidth={active ? 2.4 : 2} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="space-y-1 border-t border-slate-200 px-3 py-3 dark:border-slate-800">
            <ThemeToggle />
            <LanguageSwitcher />
          </div>

          <div className="border-t border-slate-200 p-4 dark:border-slate-800">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                {session.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                  {session.name}
                </p>
                <p className="truncate text-xs text-slate-400">
                  {ROLE_LABELS[session.role] ?? session.role}
                </p>
              </div>
            </div>
            <LogoutButton />
          </div>
        </aside>

        {mobileOpen && (
          <div
            className="fixed inset-0 z-20 bg-black/30 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="min-h-screen flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
