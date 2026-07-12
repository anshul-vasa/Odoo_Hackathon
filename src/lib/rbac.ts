import type { Role } from "@/lib/types";
import { ForbiddenError } from "@/lib/errors";

export type Resource =
  | "vehicles"
  | "drivers"
  | "trips"
  | "maintenance"
  | "fuel"
  | "dashboard"
  | "reports";

export type AccessLevel = "none" | "read" | "write";

const LEVEL_RANK: Record<AccessLevel, number> = { none: 0, read: 1, write: 2 };

// Coarse-grained resource permissions per role, derived directly from the
// spec's "Target Users" descriptions (section 2):
//   Fleet Manager     — oversees fleet assets, maintenance, vehicle lifecycle
//   Driver            — creates trips, assigns vehicles/drivers, monitors deliveries
//   Safety Officer    — driver compliance, license validity, safety scores
//   Financial Analyst — expenses, fuel, maintenance costs, profitability
const PERMISSIONS: Record<Role, Record<Resource, AccessLevel>> = {
  FLEET_MANAGER: {
    vehicles: "write",
    drivers: "write",
    trips: "write",
    maintenance: "write",
    fuel: "write",
    dashboard: "read",
    reports: "read",
  },
  DRIVER: {
    vehicles: "read",
    drivers: "read",
    trips: "write",
    maintenance: "read",
    fuel: "write",
    dashboard: "read",
    reports: "none",
  },
  SAFETY_OFFICER: {
    vehicles: "read",
    drivers: "write",
    trips: "read",
    maintenance: "read",
    fuel: "read",
    dashboard: "read",
    reports: "read",
  },
  FINANCIAL_ANALYST: {
    vehicles: "read",
    drivers: "read",
    trips: "read",
    maintenance: "read",
    fuel: "read",
    dashboard: "read",
    reports: "write",
  },
};

export function can(role: Role, resource: Resource, need: AccessLevel = "read"): boolean {
  const level = PERMISSIONS[role]?.[resource] ?? "none";
  return LEVEL_RANK[level] >= LEVEL_RANK[need];
}

export function requireCan(role: Role, resource: Resource, need: AccessLevel = "read") {
  if (!can(role, resource, need)) {
    throw new ForbiddenError(
      `Role ${role} does not have ${need} access to ${resource}.`
    );
  }
}

export function permissionsFor(role: Role) {
  return PERMISSIONS[role];
}
