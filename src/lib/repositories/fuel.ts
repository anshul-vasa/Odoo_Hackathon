import { db, toRow, toRows } from "@/lib/db";
import { newId } from "@/lib/id";
import { NotFoundError } from "@/lib/errors";
import { getVehicleById } from "@/lib/repositories/vehicles";
import type { FuelLog } from "@/lib/types";

export function listFuelLogs(vehicleId?: string): FuelLog[] {
  if (vehicleId) {
    return toRows<FuelLog>(
      db.prepare("SELECT * FROM fuel_logs WHERE vehicle_id = ? ORDER BY date DESC").all(vehicleId)
    );
  }
  return toRows<FuelLog>(db.prepare("SELECT * FROM fuel_logs ORDER BY date DESC").all());
}

export function getFuelLogById(id: string): FuelLog | undefined {
  return toRow<FuelLog>(db.prepare("SELECT * FROM fuel_logs WHERE id = ?").get(id));
}

export function createFuelLog(input: {
  vehicleId: string;
  liters: number;
  cost: number;
  date?: string;
}): FuelLog {
  const vehicle = getVehicleById(input.vehicleId);
  if (!vehicle) throw new NotFoundError("Vehicle not found.");

  const id = newId("fl");
  db.prepare(
    `INSERT INTO fuel_logs (id, vehicle_id, liters, cost, date)
     VALUES (?, ?, ?, ?, COALESCE(?, datetime('now')))`
  ).run(id, input.vehicleId, input.liters, input.cost, input.date ?? null);
  return getFuelLogById(id)!;
}

export function deleteFuelLog(id: string): void {
  db.prepare("DELETE FROM fuel_logs WHERE id = ?").run(id);
}

export function totalFuelCost(vehicleId: string): number {
  const row = db
    .prepare("SELECT COALESCE(SUM(cost), 0) as total FROM fuel_logs WHERE vehicle_id = ?")
    .get(vehicleId) as { total: number } | undefined;
  return row?.total ?? 0;
}
