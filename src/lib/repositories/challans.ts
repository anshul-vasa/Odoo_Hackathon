import { db, toRow, toRows } from "@/lib/db";
import { newId } from "@/lib/id";
import { NotFoundError, ConflictError } from "@/lib/errors";
import { getVehicleById } from "@/lib/repositories/vehicles";
import type { Challan } from "@/lib/types";

export function listChallans(vehicleId?: string): Challan[] {
  if (vehicleId) {
    return toRows<Challan>(
      db.prepare("SELECT * FROM challans WHERE vehicle_id = ? ORDER BY issued_date DESC").all(vehicleId)
    );
  }
  return toRows<Challan>(db.prepare("SELECT * FROM challans ORDER BY issued_date DESC").all());
}

export function getChallanById(id: string): Challan | undefined {
  return toRow<Challan>(db.prepare("SELECT * FROM challans WHERE id = ?").get(id));
}

export function createChallan(input: {
  vehicleId: string;
  challanNumber: string;
  reason: string;
  amount: number;
  issuedDate?: string;
}): Challan {
  const vehicle = getVehicleById(input.vehicleId);
  if (!vehicle) throw new NotFoundError("Vehicle not found.");

  const id = newId("chl");
  db.prepare(
    `INSERT INTO challans (id, vehicle_id, challan_number, reason, amount, status, issued_date)
     VALUES (?, ?, ?, ?, ?, 'PENDING', COALESCE(?, datetime('now')))`
  ).run(id, input.vehicleId, input.challanNumber, input.reason, input.amount, input.issuedDate ?? null);
  return getChallanById(id)!;
}

export function markChallanPaid(id: string): Challan {
  const challan = getChallanById(id);
  if (!challan) throw new NotFoundError("Challan not found.");
  if (challan.status === "PAID") throw new ConflictError("Challan is already marked paid.");

  db.prepare("UPDATE challans SET status = 'PAID', paid_date = datetime('now') WHERE id = ?").run(id);
  return getChallanById(id)!;
}
