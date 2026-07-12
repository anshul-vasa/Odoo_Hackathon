import { db, toRow, toRows } from "@/lib/db";
import { newId } from "@/lib/id";
import { NotFoundError, ConflictError } from "@/lib/errors";
import { getVehicleById } from "@/lib/repositories/vehicles";
import type { Challan } from "@/lib/types";

export async function listChallans(vehicleId?: string): Promise<Challan[]> {
  if (vehicleId) {
    return toRows<Challan>(
      await db.prepare("SELECT * FROM challans WHERE vehicle_id = ? ORDER BY issued_date DESC").all(vehicleId)
    );
  }
  return toRows<Challan>(await db.prepare("SELECT * FROM challans ORDER BY issued_date DESC").all());
}

export async function getChallanById(id: string): Promise<Challan | undefined> {
  return toRow<Challan>(await db.prepare("SELECT * FROM challans WHERE id = ?").get(id));
}

export async function createChallan(input: {
  vehicleId: string;
  challanNumber: string;
  reason: string;
  amount: number;
  issuedDate?: string;
}): Promise<Challan> {
  const vehicle = await getVehicleById(input.vehicleId);
  if (!vehicle) throw new NotFoundError("Vehicle not found.");

  const id = newId("chl");
  await db.prepare(
    `INSERT INTO challans (id, vehicle_id, challan_number, reason, amount, status, issued_date)
     VALUES (?, ?, ?, ?, ?, 'PENDING', COALESCE(?, datetime('now')))`
  ).run(id, input.vehicleId, input.challanNumber, input.reason, input.amount, input.issuedDate ?? null);
  return (await getChallanById(id))!;
}

export async function markChallanPaid(id: string): Promise<Challan> {
  const challan = await getChallanById(id);
  if (!challan) throw new NotFoundError("Challan not found.");
  if (challan.status === "PAID") throw new ConflictError("Challan is already marked paid.");

  await db.prepare("UPDATE challans SET status = 'PAID', paid_date = datetime('now') WHERE id = ?").run(id);
  return (await getChallanById(id))!;
}
