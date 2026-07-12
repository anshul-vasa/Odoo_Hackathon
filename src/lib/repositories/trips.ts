import { db, toRow, toRows } from "@/lib/db";
import { newId } from "@/lib/id";
import { withTransaction } from "@/lib/transaction";
import { ValidationError, NotFoundError, ConflictError } from "@/lib/errors";
import { getVehicleById, setVehicleStatus } from "@/lib/repositories/vehicles";
import {
  getDriverById,
  setDriverStatus,
  isLicenseExpired,
} from "@/lib/repositories/drivers";
import type { Trip, TripStatus } from "@/lib/types";

export interface TripFilters {
  status?: TripStatus;
  vehicleId?: string;
  driverId?: string;
}

export async function listTrips(filters: TripFilters = {}): Promise<Trip[]> {
  const clauses: string[] = [];
  const params: (string | number | null)[] = [];
  if (filters.status) {
    clauses.push("status = ?");
    params.push(filters.status);
  }
  if (filters.vehicleId) {
    clauses.push("vehicle_id = ?");
    params.push(filters.vehicleId);
  }
  if (filters.driverId) {
    clauses.push("driver_id = ?");
    params.push(filters.driverId);
  }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  return toRows<Trip>(
    await db.prepare(`SELECT * FROM trips ${where} ORDER BY created_at DESC`).all(...params)
  );
}

export async function getTripById(id: string): Promise<Trip | undefined> {
  return toRow<Trip>(await db.prepare("SELECT * FROM trips WHERE id = ?").get(id));
}

/**
 * Validates a vehicle+driver+cargo combination against every mandatory
 * business rule in the spec (section 4) that applies at assignment time.
 * Shared between createTrip (initial assignment) and dispatchTrip
 * (re-validated defensively in case state changed between Draft and Dispatch).
 */
async function assertAssignable(vehicleId: string, driverId: string, cargoWeight: number) {
  const vehicle = await getVehicleById(vehicleId);
  if (!vehicle) throw new NotFoundError("Vehicle not found.");
  const driver = await getDriverById(driverId);
  if (!driver) throw new NotFoundError("Driver not found.");

  if (vehicle.status === "RETIRED" || vehicle.status === "IN_SHOP") {
    throw new ValidationError(
      `Vehicle ${vehicle.registration_number} is ${vehicle.status === "RETIRED" ? "retired" : "in maintenance"} and cannot be dispatched.`
    );
  }
  if (vehicle.status === "ON_TRIP") {
    throw new ConflictError(
      `Vehicle ${vehicle.registration_number} is already on a trip.`
    );
  }

  if (driver.status === "SUSPENDED") {
    throw new ValidationError(`Driver ${driver.name} is suspended and cannot be assigned.`);
  }
  if (isLicenseExpired(driver)) {
    throw new ValidationError(
      `Driver ${driver.name}'s license expired on ${driver.license_expiry_date.slice(0, 10)}.`
    );
  }
  if (driver.status === "ON_TRIP") {
    throw new ConflictError(`Driver ${driver.name} is already on a trip.`);
  }
  if (driver.status === "OFF_DUTY") {
    throw new ValidationError(`Driver ${driver.name} is off duty.`);
  }

  if (cargoWeight > vehicle.max_load_capacity) {
    throw new ValidationError(
      `Cargo weight ${cargoWeight}kg exceeds ${vehicle.registration_number}'s max load capacity of ${vehicle.max_load_capacity}kg.`
    );
  }

  return { vehicle, driver };
}

export async function createTrip(input: {
  source: string;
  destination: string;
  vehicleId: string;
  driverId: string;
  cargoWeight: number;
  plannedDistance: number;
}): Promise<Trip> {
  await assertAssignable(input.vehicleId, input.driverId, input.cargoWeight);

  const id = newId("trp");
  await db.prepare(
    `INSERT INTO trips
      (id, source, destination, cargo_weight, planned_distance, vehicle_id, driver_id, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'DRAFT')`
  ).run(
    id,
    input.source,
    input.destination,
    input.cargoWeight,
    input.plannedDistance,
    input.vehicleId,
    input.driverId
  );
  return (await getTripById(id))!;
}

export async function dispatchTrip(tripId: string): Promise<Trip> {
  const trip = await getTripById(tripId);
  if (!trip) throw new NotFoundError("Trip not found.");
  if (trip.status !== "DRAFT") {
    throw new ConflictError(`Trip is ${trip.status.toLowerCase()}, not Draft — cannot dispatch.`);
  }

  // Re-validate: state may have changed since the trip was drafted.
  await assertAssignable(trip.vehicle_id, trip.driver_id, trip.cargo_weight);

  return withTransaction(async () => {
    await db.prepare(
      "UPDATE trips SET status = 'DISPATCHED', dispatched_at = datetime('now') WHERE id = ?"
    ).run(tripId);
    await setVehicleStatus(trip.vehicle_id, "ON_TRIP");
    await setDriverStatus(trip.driver_id, "ON_TRIP");
    return (await getTripById(tripId))!;
  });
}

export async function completeTrip(
  tripId: string,
  input: { actualDistance: number; fuelConsumed: number }
): Promise<Trip> {
  const trip = await getTripById(tripId);
  if (!trip) throw new NotFoundError("Trip not found.");
  if (trip.status !== "DISPATCHED") {
    throw new ConflictError(
      `Trip is ${trip.status.toLowerCase()}, not Dispatched — cannot complete.`
    );
  }
  if (input.actualDistance < 0 || input.fuelConsumed < 0) {
    throw new ValidationError("Actual distance and fuel consumed must be non-negative.");
  }

  return withTransaction(async () => {
    await db.prepare(
      `UPDATE trips
       SET status = 'COMPLETED', completed_at = datetime('now'),
           actual_distance = ?, fuel_consumed = ?
       WHERE id = ?`
    ).run(input.actualDistance, input.fuelConsumed, tripId);

    // Odometer advances by the actual distance driven.
    const vehicle = (await getVehicleById(trip.vehicle_id))!;
    await db.prepare(
      "UPDATE vehicles SET odometer = odometer + ?, updated_at = datetime('now') WHERE id = ?"
    ).run(input.actualDistance, vehicle.id);

    await setVehicleStatus(trip.vehicle_id, "AVAILABLE");
    await setDriverStatus(trip.driver_id, "AVAILABLE");
    return (await getTripById(tripId))!;
  });
}

export async function cancelTrip(tripId: string): Promise<Trip> {
  const trip = await getTripById(tripId);
  if (!trip) throw new NotFoundError("Trip not found.");
  if (trip.status === "COMPLETED" || trip.status === "CANCELLED") {
    throw new ConflictError(`Trip is already ${trip.status.toLowerCase()}.`);
  }

  const wasDispatched = trip.status === "DISPATCHED";

  return withTransaction(async () => {
    await db.prepare(
      "UPDATE trips SET status = 'CANCELLED', cancelled_at = datetime('now') WHERE id = ?"
    ).run(tripId);

    // Only a *dispatched* trip holds the vehicle/driver On Trip; a Draft never did.
    if (wasDispatched) {
      await setVehicleStatus(trip.vehicle_id, "AVAILABLE");
      await setDriverStatus(trip.driver_id, "AVAILABLE");
    }
    return (await getTripById(tripId))!;
  });
}
