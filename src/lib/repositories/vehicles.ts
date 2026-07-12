import { db, toRow, toRows } from "@/lib/db";
import { newId } from "@/lib/id";
import type { Vehicle, VehicleStatus } from "@/lib/types";

export interface VehicleFilters {
  type?: string;
  status?: VehicleStatus;
  region?: string;
}

export function listVehicles(filters: VehicleFilters = {}): Vehicle[] {
  const clauses: string[] = [];
  const params: (string | number | null)[] = [];

  if (filters.type) {
    clauses.push("type = ?");
    params.push(filters.type);
  }
  if (filters.status) {
    clauses.push("status = ?");
    params.push(filters.status);
  }
  if (filters.region) {
    clauses.push("region = ?");
    params.push(filters.region);
  }

  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  return toRows<Vehicle>(
    db.prepare(`SELECT * FROM vehicles ${where} ORDER BY created_at DESC`).all(...params)
  );
}

export function getVehicleById(id: string): Vehicle | undefined {
  return toRow<Vehicle>(db.prepare("SELECT * FROM vehicles WHERE id = ?").get(id));
}

export function getVehicleByRegistration(
  registrationNumber: string
): Vehicle | undefined {
  return toRow<Vehicle>(
    db.prepare("SELECT * FROM vehicles WHERE registration_number = ?").get(registrationNumber)
  );
}

export function createVehicle(input: {
  registrationNumber: string;
  name: string;
  type: string;
  maxLoadCapacity: number;
  odometer?: number;
  acquisitionCost: number;
  region?: string | null;
  chassisNumber?: string | null;
  insuranceExpiry?: string | null;
  pucExpiry?: string | null;
  fastagId?: string | null;
  fastagBalance?: number | null;
}): Vehicle {
  const id = newId("veh");
  db.prepare(
    `INSERT INTO vehicles
      (id, registration_number, name, type, max_load_capacity, odometer, acquisition_cost, region, chassis_number, insurance_expiry, puc_expiry, fastag_id, fastag_balance, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'AVAILABLE')`
  ).run(
    id,
    input.registrationNumber,
    input.name,
    input.type,
    input.maxLoadCapacity,
    input.odometer ?? 0,
    input.acquisitionCost,
    input.region ?? null,
    input.chassisNumber ?? null,
    input.insuranceExpiry ?? null,
    input.pucExpiry ?? null,
    input.fastagId ?? null,
    input.fastagBalance ?? 0
  );
  return getVehicleById(id)!;
}

export function updateVehicle(
  id: string,
  input: Partial<{
    name: string;
    type: string;
    maxLoadCapacity: number;
    odometer: number;
    acquisitionCost: number;
    region: string | null;
    chassisNumber: string | null;
    insuranceExpiry: string | null;
    pucExpiry: string | null;
    fastagId: string | null;
    fastagBalance: number | null;
    status: VehicleStatus;
  }>
): Vehicle | undefined {
  const fields: string[] = [];
  const params: (string | number | null)[] = [];

  const map: Record<string, string | number | null | undefined> = {
    name: input.name,
    type: input.type,
    max_load_capacity: input.maxLoadCapacity,
    odometer: input.odometer,
    acquisition_cost: input.acquisitionCost,
    region: input.region,
    chassis_number: input.chassisNumber,
    insurance_expiry: input.insuranceExpiry,
    puc_expiry: input.pucExpiry,
    fastag_id: input.fastagId,
    fastag_balance: input.fastagBalance,
    status: input.status,
  };

  for (const [col, val] of Object.entries(map)) {
    if (val !== undefined) {
      fields.push(`${col} = ?`);
      params.push(val);
    }
  }
  if (fields.length === 0) return getVehicleById(id);

  fields.push("updated_at = datetime('now')");
  params.push(id);

  db.prepare(`UPDATE vehicles SET ${fields.join(", ")} WHERE id = ?`).run(...params);
  return getVehicleById(id);
}

export function setVehicleStatus(id: string, status: VehicleStatus): void {
  db.prepare(
    "UPDATE vehicles SET status = ?, updated_at = datetime('now') WHERE id = ?"
  ).run(status, id);
}

export function deleteVehicle(id: string): void {
  db.prepare("DELETE FROM vehicles WHERE id = ?").run(id);
}
