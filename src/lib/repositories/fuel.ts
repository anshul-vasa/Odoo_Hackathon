import { db, toRow, toRows } from "@/lib/db";
import { newId } from "@/lib/id";
import { NotFoundError } from "@/lib/errors";
import { getVehicleById } from "@/lib/repositories/vehicles";
import type { FuelLog } from "@/lib/types";

export async function listFuelLogs(vehicleId?: string): Promise<FuelLog[]> {
  if (vehicleId) {
    return toRows<FuelLog>(
      await db.prepare("SELECT * FROM fuel_logs WHERE vehicle_id = ? ORDER BY date DESC").all(vehicleId)
    );
  }
  return toRows<FuelLog>(await db.prepare("SELECT * FROM fuel_logs ORDER BY date DESC").all());
}

export async function getFuelLogById(id: string): Promise<FuelLog | undefined> {
  return toRow<FuelLog>(await db.prepare("SELECT * FROM fuel_logs WHERE id = ?").get(id));
}

export async function createFuelLog(input: {
  vehicleId: string;
  liters: number;
  cost: number;
  date?: string;
}): Promise<FuelLog> {
  const vehicle = await getVehicleById(input.vehicleId);
  if (!vehicle) throw new NotFoundError("Vehicle not found.");

  const id = newId("fl");
  await db.prepare(
    `INSERT INTO fuel_logs (id, vehicle_id, liters, cost, date)
     VALUES (?, ?, ?, ?, COALESCE(?, datetime('now')))`
  ).run(id, input.vehicleId, input.liters, input.cost, input.date ?? null);
  return (await getFuelLogById(id))!;
}

export async function deleteFuelLog(id: string): Promise<void> {
  await db.prepare("DELETE FROM fuel_logs WHERE id = ?").run(id);
}

export async function totalFuelCost(vehicleId: string): Promise<number> {
  const row = (await db
    .prepare("SELECT COALESCE(SUM(cost), 0) as total FROM fuel_logs WHERE vehicle_id = ?")
    .get(vehicleId)) as { total: number } | undefined;
  return row?.total ?? 0;
}
