import { db, toRow, toRows } from "@/lib/db";
import { newId } from "@/lib/id";
import { NotFoundError } from "@/lib/errors";
import { getVehicleById } from "@/lib/repositories/vehicles";
import type { Expense } from "@/lib/types";

export async function listExpenses(vehicleId?: string): Promise<Expense[]> {
  if (vehicleId) {
    return toRows<Expense>(
      await db.prepare("SELECT * FROM expenses WHERE vehicle_id = ? ORDER BY date DESC").all(vehicleId)
    );
  }
  return toRows<Expense>(await db.prepare("SELECT * FROM expenses ORDER BY date DESC").all());
}

export async function getExpenseById(id: string): Promise<Expense | undefined> {
  return toRow<Expense>(await db.prepare("SELECT * FROM expenses WHERE id = ?").get(id));
}

export async function createExpense(input: {
  vehicleId: string;
  type: string;
  amount: number;
  date?: string;
  description?: string | null;
}): Promise<Expense> {
  const vehicle = await getVehicleById(input.vehicleId);
  if (!vehicle) throw new NotFoundError("Vehicle not found.");

  const id = newId("exp");
  await db.prepare(
    `INSERT INTO expenses (id, vehicle_id, type, amount, date, description)
     VALUES (?, ?, ?, ?, COALESCE(?, datetime('now')), ?)`
  ).run(id, input.vehicleId, input.type, input.amount, input.date ?? null, input.description ?? null);
  return (await getExpenseById(id))!;
}

export async function deleteExpense(id: string): Promise<void> {
  await db.prepare("DELETE FROM expenses WHERE id = ?").run(id);
}

export async function totalExpenseCost(vehicleId: string): Promise<number> {
  const row = (await db
    .prepare("SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE vehicle_id = ?")
    .get(vehicleId)) as { total: number } | undefined;
  return row?.total ?? 0;
}

export async function totalMaintenanceCost(vehicleId: string): Promise<number> {
  const row = (await db
    .prepare(
      "SELECT COALESCE(SUM(cost), 0) as total FROM maintenance_records WHERE vehicle_id = ?"
    )
    .get(vehicleId)) as { total: number } | undefined;
  return row?.total ?? 0;
}
