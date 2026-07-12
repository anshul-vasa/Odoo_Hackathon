import { db, toRow, toRows } from "@/lib/db";
import { newId } from "@/lib/id";
import type { Driver, DriverStatus } from "@/lib/types";

export interface DriverFilters {
  status?: DriverStatus;
}

export async function listDrivers(filters: DriverFilters = {}): Promise<Driver[]> {
  const clauses: string[] = [];
  const params: (string | number | null)[] = [];

  if (filters.status) {
    clauses.push("status = ?");
    params.push(filters.status);
  }

  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  return toRows<Driver>(
    await db.prepare(`SELECT * FROM drivers ${where} ORDER BY created_at DESC`).all(...params)
  );
}

export async function getDriverById(id: string): Promise<Driver | undefined> {
  return toRow<Driver>(await db.prepare("SELECT * FROM drivers WHERE id = ?").get(id));
}

export async function getDriverByLicenseNumber(licenseNumber: string): Promise<Driver | undefined> {
  return toRow<Driver>(
    await db.prepare("SELECT * FROM drivers WHERE license_number = ?").get(licenseNumber)
  );
}

export async function createDriver(input: {
  name: string;
  licenseNumber: string;
  licenseCategory: string;
  licenseExpiryDate: string; // ISO date
  contactNumber: string;
  safetyScore?: number;
  userId?: string | null;
}): Promise<Driver> {
  const id = newId("drv");
  await db.prepare(
    `INSERT INTO drivers
      (id, name, license_number, license_category, license_expiry_date, contact_number, safety_score, status, user_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'AVAILABLE', ?)`
  ).run(
    id,
    input.name,
    input.licenseNumber,
    input.licenseCategory,
    input.licenseExpiryDate,
    input.contactNumber,
    input.safetyScore ?? 100,
    input.userId ?? null
  );
  return (await getDriverById(id))!;
}

export async function updateDriver(
  id: string,
  input: Partial<{
    name: string;
    licenseNumber: string;
    licenseCategory: string;
    licenseExpiryDate: string;
    contactNumber: string;
    safetyScore: number;
    status: DriverStatus;
  }>
): Promise<Driver | undefined> {
  const fields: string[] = [];
  const params: (string | number | null)[] = [];

  const map: Record<string, string | number | null | undefined> = {
    name: input.name,
    license_number: input.licenseNumber,
    license_category: input.licenseCategory,
    license_expiry_date: input.licenseExpiryDate,
    contact_number: input.contactNumber,
    safety_score: input.safetyScore,
    status: input.status,
  };

  for (const [col, val] of Object.entries(map)) {
    if (val !== undefined) {
      fields.push(`${col} = ?`);
      params.push(val);
    }
  }
  if (fields.length === 0) return getDriverById(id);

  fields.push("updated_at = datetime('now')");
  params.push(id);

  await db.prepare(`UPDATE drivers SET ${fields.join(", ")} WHERE id = ?`).run(...params);
  return getDriverById(id);
}

export async function setDriverStatus(id: string, status: DriverStatus): Promise<void> {
  await db.prepare(
    "UPDATE drivers SET status = ?, updated_at = datetime('now') WHERE id = ?"
  ).run(status, id);
}

export async function deleteDriver(id: string): Promise<void> {
  await db.prepare("DELETE FROM drivers WHERE id = ?").run(id);
}

export function isLicenseExpired(driver: Driver, at: Date = new Date()): boolean {
  return new Date(driver.license_expiry_date).getTime() < at.getTime();
}
