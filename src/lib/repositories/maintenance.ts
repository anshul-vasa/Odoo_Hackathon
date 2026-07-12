import { db, toRow, toRows } from "@/lib/db";
import { newId } from "@/lib/id";
import { withTransaction } from "@/lib/transaction";
import { NotFoundError, ConflictError, ValidationError } from "@/lib/errors";
import { getVehicleById, setVehicleStatus } from "@/lib/repositories/vehicles";
import type { MaintenanceRecord } from "@/lib/types";

// Full Maintenance workflow (Screen 7 in the spec) is teammate territory —
// this is the minimal slice needed so "automatic status transitions" (this
// module's mandatory deliverable) is demonstrably complete end-to-end:
// creating an active record flips the vehicle to In Shop, closing it restores
// Available (unless the vehicle has since been Retired). Extend freely.

export async function listMaintenanceRecords(vehicleId?: string): Promise<MaintenanceRecord[]> {
  if (vehicleId) {
    return toRows<MaintenanceRecord>(
      await db
        .prepare("SELECT * FROM maintenance_records WHERE vehicle_id = ? ORDER BY created_at DESC")
        .all(vehicleId)
    );
  }
  return toRows<MaintenanceRecord>(
    await db.prepare("SELECT * FROM maintenance_records ORDER BY created_at DESC").all()
  );
}

export async function getMaintenanceRecordById(id: string): Promise<MaintenanceRecord | undefined> {
  return toRow<MaintenanceRecord>(
    await db.prepare("SELECT * FROM maintenance_records WHERE id = ?").get(id)
  );
}

export async function createMaintenanceRecord(input: {
  vehicleId: string;
  description: string;
  cost?: number;
}): Promise<MaintenanceRecord> {
  const vehicle = await getVehicleById(input.vehicleId);
  if (!vehicle) throw new NotFoundError("Vehicle not found.");
  if (vehicle.status === "ON_TRIP") {
    throw new ValidationError(
      "Vehicle is currently on a trip — it must be Available before entering maintenance."
    );
  }
  if (vehicle.status === "RETIRED") {
    throw new ValidationError("Vehicle is retired — cannot open a maintenance record.");
  }

  const id = newId("mnt");
  return withTransaction(async () => {
    await db.prepare(
      `INSERT INTO maintenance_records (id, vehicle_id, description, cost, status)
       VALUES (?, ?, ?, ?, 'OPEN')`
    ).run(id, input.vehicleId, input.description, input.cost ?? 0);
    // Rule: creating an active maintenance record automatically switches the
    // vehicle to In Shop, removing it from the driver's/dispatch selection pool.
    await setVehicleStatus(input.vehicleId, "IN_SHOP");
    return (await getMaintenanceRecordById(id))!;
  });
}

export async function closeMaintenanceRecord(id: string): Promise<MaintenanceRecord> {
  const record = await getMaintenanceRecordById(id);
  if (!record) throw new NotFoundError("Maintenance record not found.");
  if (record.status === "CLOSED") {
    throw new ConflictError("Maintenance record is already closed.");
  }

  return withTransaction(async () => {
    await db.prepare(
      "UPDATE maintenance_records SET status = 'CLOSED', closed_at = datetime('now') WHERE id = ?"
    ).run(id);

    // Rule: closing maintenance restores the vehicle to Available — unless it
    // has since been retired (retirement always wins).
    const vehicle = await getVehicleById(record.vehicle_id);
    if (vehicle && vehicle.status !== "RETIRED") {
      await setVehicleStatus(record.vehicle_id, "AVAILABLE");
    }
    return (await getMaintenanceRecordById(id))!;
  });
}
