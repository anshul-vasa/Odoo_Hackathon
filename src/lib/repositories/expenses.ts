import { db, toRow, toRows } from "@/lib/db";
import { newId } from "@/lib/id";
import { NotFoundError } from "@/lib/errors";
import { getVehicleById } from "@/lib/repositories/vehicles";
import type { Expense } from "@/lib/types";

export function listExpenses(vehicleId?: string): Expense[] {
  if (vehicleId) {
    return toRows<Expense>(
      db.prepare("SELECT * FROM expenses WHERE vehicle_id = ? ORDER BY date DESC").all(vehicleId)
    );
  }
  return toRows<Expense>(db.prepare("SELECT * FROM expenses ORDER BY date DESC").all());
}

export function getExpenseById(id: string): Expense | undefined {
  return toRow<Expense>(db.prepare("SELECT * FROM expenses WHERE id = ?").get(id));
}

export function createExpense(input: {
  vehicleId: string;
  type: string;
  amount: number;
  date?: string;
  description?: string | null;
}): Expense {
  const vehicle = getVehicleById(input.vehicleId);
  if (!vehicle) throw new NotFoundError("Vehicle not found.");

  const id = newId("exp");
  db.prepare(
    `INSERT INTO expenses (id, vehicle_id, type, amount, date, description)
     VALUES (?, ?, ?, ?, COALESCE(?, datetime('now')), ?)`
  ).run(id, input.vehicleId, input.type, input.amount, input.date ?? null, input.description ?? null);
  return getExpenseById(id)!;
}

export function deleteExpense(id: string): void {
  db.prepare("DELETE FROM expenses WHERE id = ?").run(id);
}

export function totalExpenseCost(vehicleId: string): number {
  const row = db
    .prepare("SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE vehicle_id = ?")
    .get(vehicleId) as { total: number } | undefined;
  return row?.total ?? 0;
}

export function totalMaintenanceCost(vehicleId: string): number {
  const row = db
    .prepare(
      "SELECT COALESCE(SUM(cost), 0) as total FROM maintenance_records WHERE vehicle_id = ?"
    )
    .get(vehicleId) as { total: number } | undefined;
  return row?.total ?? 0;
}
