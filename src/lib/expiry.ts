import type { Driver, Vehicle } from "@/lib/types";

const DAY_MS = 24 * 60 * 60 * 1000;

export interface ExpiringItem {
  label: string;
  detail: string;
  date: string;
  daysLeft: number;
  href: string;
}

function daysUntil(dateStr: string, now: Date): number {
  return Math.ceil((new Date(dateStr).getTime() - now.getTime()) / DAY_MS);
}

export function getExpiringLicenses(drivers: Driver[], withinDays = 30, now = new Date()): ExpiringItem[] {
  return drivers
    .map((d) => ({ d, days: daysUntil(d.license_expiry_date, now) }))
    .filter(({ days }) => days <= withinDays)
    .sort((a, b) => a.days - b.days)
    .map(({ d, days }) => ({
      label: d.name,
      detail: `License ${d.license_number}`,
      date: d.license_expiry_date.slice(0, 10),
      daysLeft: days,
      href: "/drivers",
    }));
}

export function getExpiringVehicleDocs(vehicles: Vehicle[], withinDays = 30, now = new Date()): ExpiringItem[] {
  const items: ExpiringItem[] = [];
  for (const v of vehicles) {
    if (v.insurance_expiry) {
      const days = daysUntil(v.insurance_expiry, now);
      if (days <= withinDays) {
        items.push({
          label: v.registration_number,
          detail: "Insurance",
          date: v.insurance_expiry.slice(0, 10),
          daysLeft: days,
          href: `/vehicles/${v.id}`,
        });
      }
    }
    if (v.puc_expiry) {
      const days = daysUntil(v.puc_expiry, now);
      if (days <= withinDays) {
        items.push({
          label: v.registration_number,
          detail: "PUC certificate",
          date: v.puc_expiry.slice(0, 10),
          daysLeft: days,
          href: `/vehicles/${v.id}`,
        });
      }
    }
  }
  return items.sort((a, b) => a.daysLeft - b.daysLeft);
}
