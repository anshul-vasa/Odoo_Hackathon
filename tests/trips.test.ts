// Automated tests for the trip-assignment business rules (spec section 4) —
// the highest-risk logic in the app. Run with: npm test
//
// Uses a throwaway SQLite file (set via TRANSITOPS_DB_PATH in package.json's
// "test" script) so this never touches real dev data, and node:test /
// node:assert — both built into Node 22, so no extra test-framework install.

import { test, after } from "node:test";
import assert from "node:assert/strict";
import { db } from "../src/lib/db";
import { createVehicle, setVehicleStatus } from "../src/lib/repositories/vehicles";
import { createDriver, setDriverStatus } from "../src/lib/repositories/drivers";
import { createTrip, dispatchTrip, completeTrip, cancelTrip, getTripById } from "../src/lib/repositories/trips";
import { createMaintenanceRecord, closeMaintenanceRecord } from "../src/lib/repositories/maintenance";
import { ValidationError, ConflictError } from "../src/lib/errors";
import { can } from "../src/lib/rbac";

// tests/setup.mjs (loaded via --import before this file) points
// TRANSITOPS_DB_PATH at a fresh throwaway database file, so nothing here
// touches real dev data.

after(() => {
  db.close();
});

function futureDate(days = 365) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}
function pastDate(days = 30) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

let seq = 0;
function makeVehicle(overrides: Partial<Parameters<typeof createVehicle>[0]> = {}) {
  seq++;
  return createVehicle({
    registrationNumber: `TEST-VEH-${seq}`,
    name: `Test Vehicle ${seq}`,
    type: "Van",
    maxLoadCapacity: 500,
    acquisitionCost: 100000,
    ...overrides,
  });
}
function makeDriver(overrides: Partial<Parameters<typeof createDriver>[0]> = {}) {
  seq++;
  return createDriver({
    name: `Test Driver ${seq}`,
    licenseNumber: `TEST-DL-${seq}`,
    licenseCategory: "LMV",
    licenseExpiryDate: futureDate(),
    contactNumber: "9999999999",
    ...overrides,
  });
}

async function getVehicleRow(id: string) {
  return db.prepare("SELECT * FROM vehicles WHERE id = ?").get(id) as any;
}
async function getDriverRow(id: string) {
  return db.prepare("SELECT * FROM drivers WHERE id = ?").get(id) as any;
}

test("the spec's exact example workflow: create -> dispatch -> complete", async () => {
  const vehicle = await makeVehicle({ maxLoadCapacity: 500 });
  const driver = await makeDriver();

  const trip = await createTrip({
    source: "Ahmedabad",
    destination: "Surat",
    vehicleId: vehicle.id,
    driverId: driver.id,
    cargoWeight: 450,
    plannedDistance: 120,
  });
  assert.equal(trip.status, "DRAFT");

  await dispatchTrip(trip.id);
  assert.equal((await getTripById(trip.id))!.status, "DISPATCHED");
  assert.equal((await getVehicleRow(vehicle.id)).status, "ON_TRIP");
  assert.equal((await getDriverRow(driver.id)).status, "ON_TRIP");

  await completeTrip(trip.id, { actualDistance: 118, fuelConsumed: 15 });
  const completed = (await getTripById(trip.id))!;
  assert.equal(completed.status, "COMPLETED");
  assert.equal((await getVehicleRow(vehicle.id)).status, "AVAILABLE");
  assert.equal((await getDriverRow(driver.id)).status, "AVAILABLE");
  // Odometer should have advanced by the actual distance entered.
  assert.equal((await getVehicleRow(vehicle.id)).odometer, 118);
});

test("rejects cargo weight over the vehicle's max load capacity", async () => {
  const vehicle = await makeVehicle({ maxLoadCapacity: 500 });
  const driver = await makeDriver();

  await assert.rejects(
    () =>
      createTrip({
        source: "A",
        destination: "B",
        vehicleId: vehicle.id,
        driverId: driver.id,
        cargoWeight: 600,
        plannedDistance: 10,
      }),
    ValidationError
  );
});

test("rejects a driver with an expired license", async () => {
  const vehicle = await makeVehicle();
  const driver = await makeDriver({ licenseExpiryDate: pastDate() });

  await assert.rejects(
    () =>
      createTrip({
        source: "A",
        destination: "B",
        vehicleId: vehicle.id,
        driverId: driver.id,
        cargoWeight: 100,
        plannedDistance: 10,
      }),
    ValidationError
  );
});

test("rejects a suspended driver", async () => {
  const vehicle = await makeVehicle();
  const driver = await makeDriver();
  await setDriverStatus(driver.id, "SUSPENDED");

  await assert.rejects(
    () =>
      createTrip({
        source: "A",
        destination: "B",
        vehicleId: vehicle.id,
        driverId: driver.id,
        cargoWeight: 100,
        plannedDistance: 10,
      }),
    ValidationError
  );
});

test("blocks assigning a vehicle that is already on a trip", async () => {
  const vehicle = await makeVehicle();
  const driver1 = await makeDriver();
  const driver2 = await makeDriver();

  const trip1 = await createTrip({
    source: "A",
    destination: "B",
    vehicleId: vehicle.id,
    driverId: driver1.id,
    cargoWeight: 100,
    plannedDistance: 10,
  });
  await dispatchTrip(trip1.id);

  await assert.rejects(
    () =>
      createTrip({
        source: "A",
        destination: "B",
        vehicleId: vehicle.id,
        driverId: driver2.id,
        cargoWeight: 100,
        plannedDistance: 10,
      }),
    ConflictError
  );
});

test("blocks assigning a retired or in-shop vehicle", async () => {
  const retiredVehicle = await makeVehicle();
  await setVehicleStatus(retiredVehicle.id, "RETIRED");
  const inShopVehicle = await makeVehicle();
  await setVehicleStatus(inShopVehicle.id, "IN_SHOP");
  const driver = await makeDriver();

  for (const vehicle of [retiredVehicle, inShopVehicle]) {
    await assert.rejects(
      () =>
        createTrip({
          source: "A",
          destination: "B",
          vehicleId: vehicle.id,
          driverId: driver.id,
          cargoWeight: 100,
          plannedDistance: 10,
        }),
      ValidationError
    );
  }
});

test("cancelling a Draft trip does not change vehicle/driver status", async () => {
  const vehicle = await makeVehicle();
  const driver = await makeDriver();
  const trip = await createTrip({
    source: "A",
    destination: "B",
    vehicleId: vehicle.id,
    driverId: driver.id,
    cargoWeight: 100,
    plannedDistance: 10,
  });

  await cancelTrip(trip.id);

  assert.equal((await getVehicleRow(vehicle.id)).status, "AVAILABLE");
  assert.equal((await getDriverRow(driver.id)).status, "AVAILABLE");
  assert.equal((await getTripById(trip.id))!.status, "CANCELLED");
});

test("cancelling a Dispatched trip reverts vehicle and driver to Available", async () => {
  const vehicle = await makeVehicle();
  const driver = await makeDriver();
  const trip = await createTrip({
    source: "A",
    destination: "B",
    vehicleId: vehicle.id,
    driverId: driver.id,
    cargoWeight: 100,
    plannedDistance: 10,
  });
  await dispatchTrip(trip.id);

  await cancelTrip(trip.id);

  assert.equal((await getVehicleRow(vehicle.id)).status, "AVAILABLE");
  assert.equal((await getDriverRow(driver.id)).status, "AVAILABLE");
});

test("opening a maintenance record switches the vehicle to In Shop; closing restores Available", async () => {
  const vehicle = await makeVehicle();
  assert.equal((await getVehicleRow(vehicle.id)).status, "AVAILABLE");

  const record = await createMaintenanceRecord({ vehicleId: vehicle.id, description: "Oil change", cost: 500 });
  assert.equal((await getVehicleRow(vehicle.id)).status, "IN_SHOP");

  await closeMaintenanceRecord(record.id);
  assert.equal((await getVehicleRow(vehicle.id)).status, "AVAILABLE");
});

test("closing maintenance never un-retires a vehicle", async () => {
  const vehicle = await makeVehicle();
  const record = await createMaintenanceRecord({ vehicleId: vehicle.id, description: "Engine work", cost: 5000 });
  // Vehicle is retired *while* the maintenance record is still open.
  await setVehicleStatus(vehicle.id, "RETIRED");

  await closeMaintenanceRecord(record.id);

  assert.equal((await getVehicleRow(vehicle.id)).status, "RETIRED");
});

test("RBAC: role permission matrix matches the spec's role descriptions", () => {
  assert.equal(can("FLEET_MANAGER", "vehicles", "write"), true);
  assert.equal(can("DRIVER", "vehicles", "write"), false);
  assert.equal(can("DRIVER", "trips", "write"), true);
  assert.equal(can("SAFETY_OFFICER", "drivers", "write"), true);
  assert.equal(can("SAFETY_OFFICER", "vehicles", "write"), false);
  assert.equal(can("FINANCIAL_ANALYST", "reports", "write"), true);
  assert.equal(can("FINANCIAL_ANALYST", "vehicles", "write"), false);
});
