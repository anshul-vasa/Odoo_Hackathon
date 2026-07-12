/**
 * Demo data seed. Run with: npm run seed
 * Safe to re-run — skips records that already exist (by unique key), except
 * the bulk-scale section (30 vehicles/drivers, 40-60 trips, fuel/expense/
 * maintenance history) which only runs once, gated on the presence of
 * "DL-2100" (the first bulk-seeded driver) so re-running never duplicates it.
 */
import { db } from "../src/lib/db";
import { hashPassword } from "../src/lib/auth";
import { createUser, getUserByEmail } from "../src/lib/repositories/users";
import {
  createVehicle,
  getVehicleByRegistration,
  setVehicleStatus,
  listVehicles,
} from "../src/lib/repositories/vehicles";
import {
  createDriver,
  getDriverByLicenseNumber,
  listDrivers,
} from "../src/lib/repositories/drivers";
import {
  createTrip,
  dispatchTrip,
  completeTrip,
  cancelTrip,
} from "../src/lib/repositories/trips";
import { createFuelLog } from "../src/lib/repositories/fuel";
import { createExpense } from "../src/lib/repositories/expenses";
import { createMaintenanceRecord, closeMaintenanceRecord } from "../src/lib/repositories/maintenance";
import { createChallan } from "../src/lib/repositories/challans";
import type { Role } from "../src/lib/types";

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}
function randInt(min: number, max: number) {
  return Math.floor(rand(min, max + 1));
}
function pick<T>(arr: T[]): T {
  return arr[randInt(0, arr.length - 1)];
}
function daysAgoIso(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}
function daysFromNowIso(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}
function toSqlDatetime(iso: string) {
  return iso.slice(0, 19).replace("T", " ");
}

async function ensureUser(name: string, email: string, role: Role, password: string) {
  if (await getUserByEmail(email)) {
    console.log(`  user ${email} already exists, skipping`);
    return;
  }
  const passwordHash = await hashPassword(password);
  await createUser({ name, email, passwordHash, role });
  console.log(`  created ${role} -> ${email} / ${password}`);
}

async function ensureVehicle(input: Parameters<typeof createVehicle>[0]) {
  if (await getVehicleByRegistration(input.registrationNumber)) {
    console.log(`  vehicle ${input.registrationNumber} already exists, skipping`);
    return;
  }
  await createVehicle(input);
  console.log(`  created vehicle ${input.registrationNumber}`);
}

async function ensureDriver(input: Parameters<typeof createDriver>[0]) {
  if (await getDriverByLicenseNumber(input.licenseNumber)) {
    console.log(`  driver ${input.licenseNumber} already exists, skipping`);
    return;
  }
  await createDriver(input);
  console.log(`  created driver ${input.name}`);
}

const CITIES = [
  "Ahmedabad", "Mumbai", "Delhi", "Bengaluru", "Chennai", "Kolkata", "Hyderabad",
  "Pune", "Surat", "Jaipur", "Lucknow", "Nagpur", "Indore", "Vadodara",
  "Rajkot", "Gandhinagar", "Chandigarh", "Bhopal", "Coimbatore", "Nashik",
];

const VEHICLE_TYPES = ["Van", "Truck", "Mini-Truck", "Bus", "Tempo"];

const FIRST_NAMES = [
  "Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Reyansh", "Krishna",
  "Ishaan", "Rohan", "Aisha", "Diya", "Ananya", "Priya", "Isha", "Kavya",
  "Meera", "Riya", "Sneha", "Neha", "Rahul", "Amit", "Suresh", "Ramesh",
  "Vikram", "Anjali", "Pooja", "Deepika", "Kiran", "Manish",
];
const LAST_NAMES = [
  "Sharma", "Verma", "Patel", "Gupta", "Singh", "Kumar", "Reddy", "Nair",
  "Iyer", "Rao", "Mehta", "Shah", "Joshi", "Desai", "Chopra", "Malhotra",
  "Kapoor", "Bhatt", "Trivedi", "Pillai",
];

async function main() {
  console.log("Seeding demo users (one per role)...");
  await ensureUser("Priya Fleet", "fleet.manager@transitops.demo", "FLEET_MANAGER", "password123");
  await ensureUser("Sam Driver", "driver@transitops.demo", "DRIVER", "password123");
  await ensureUser("Nora Safety", "safety.officer@transitops.demo", "SAFETY_OFFICER", "password123");
  await ensureUser("Raj Finance", "financial.analyst@transitops.demo", "FINANCIAL_ANALYST", "password123");

  console.log("Seeding core demo vehicles (spec's example workflow)...");
  await ensureVehicle({
    registrationNumber: "Van-05",
    name: "Van-05",
    type: "Van",
    maxLoadCapacity: 500,
    acquisitionCost: 25000,
    region: "Ahmedabad",
    chassisNumber: "CHS-VAN05-0001",
    insuranceExpiry: daysFromNowIso(200),
    pucExpiry: daysFromNowIso(90),
  });
  await ensureVehicle({
    registrationNumber: "Truck-11",
    name: "Truck-11",
    type: "Truck",
    maxLoadCapacity: 2000,
    acquisitionCost: 60000,
    region: "Mumbai",
    chassisNumber: "CHS-TRK11-0001",
    insuranceExpiry: daysFromNowIso(200),
    pucExpiry: daysFromNowIso(90),
  });
  await ensureVehicle({
    registrationNumber: "Van-12",
    name: "Van-12",
    type: "Van",
    maxLoadCapacity: 450,
    acquisitionCost: 22000,
    region: "Ahmedabad",
    chassisNumber: "CHS-VAN12-0001",
    insuranceExpiry: daysFromNowIso(200),
    pucExpiry: daysFromNowIso(90),
  });
  await ensureVehicle({
    registrationNumber: "Truck-02",
    name: "Truck-02",
    type: "Truck",
    maxLoadCapacity: 3000,
    acquisitionCost: 75000,
    region: "Delhi",
    chassisNumber: "CHS-TRK02-0001",
    insuranceExpiry: daysFromNowIso(200),
    pucExpiry: daysFromNowIso(90),
  });

  console.log("Seeding core demo drivers (spec's example workflow)...");
  const inOneYear = daysFromNowIso(365);
  const lastYear = daysAgoIso(365);

  await ensureDriver({
    name: "Alex",
    licenseNumber: "DL-1001",
    licenseCategory: "LMV",
    licenseExpiryDate: inOneYear,
    contactNumber: "555-0101",
    safetyScore: 95,
  });
  await ensureDriver({
    name: "Bianca",
    licenseNumber: "DL-1002",
    licenseCategory: "HMV",
    licenseExpiryDate: inOneYear,
    contactNumber: "555-0102",
    safetyScore: 88,
  });
  await ensureDriver({
    name: "Carlos (expired license — for demoing the block)",
    licenseNumber: "DL-1003",
    licenseCategory: "LMV",
    licenseExpiryDate: lastYear,
    contactNumber: "555-0103",
    safetyScore: 70,
  });

  // --- Bulk scale-up: ~30 vehicles, ~30 drivers, 40-60 trips, fuel/expense/
  // maintenance history. Gated so it only ever runs once. Gated on the first
  // BULK DRIVER's license number rather than a vehicle registration number —
  // bulk vehicle registrations are named after a *randomly picked* type
  // (Van-101 only exists if the first iteration happens to roll "Van"), so
  // using one as a re-run guard would only work by luck and could otherwise
  // silently duplicate trips/fuel/maintenance/challans on a second run.
  // License numbers are assigned deterministically by index, so this is safe.
  if (await getDriverByLicenseNumber("DL-2100")) {
    console.log("Bulk demo data already seeded, skipping.");
    console.log("Done.");
    return;
  }

  console.log("Seeding ~30 additional vehicles across India...");
  const bulkVehicleCount = 30;
  for (let i = 0; i < bulkVehicleCount; i++) {
    const type = pick(VEHICLE_TYPES);
    const capacity =
      type === "Truck" ? randInt(1500, 5000) : type === "Bus" ? randInt(200, 800) : randInt(300, 1200);
    const prefix =
      type === "Van" ? "Van" : type === "Truck" ? "Truck" : type === "Bus" ? "Bus" : type === "Mini-Truck" ? "MiniTruck" : "Tempo";
    const reg = `${prefix}-${101 + i}`;
    const retired = i % 17 === 0; // a couple of retired vehicles for realism
    const insuranceSoon = i % 9 === 0; // some expiring within ~a month, for expiry-alert demo
    const pucSoon = i % 11 === 0;
    await ensureVehicle({
      registrationNumber: reg,
      name: `${type} ${101 + i}`,
      type,
      maxLoadCapacity: capacity,
      acquisitionCost: Math.round(rand(180000, 4500000)),
      region: pick(CITIES),
      chassisNumber: `CHS-${reg.toUpperCase()}-${randInt(1000, 9999)}`,
      insuranceExpiry: insuranceSoon ? daysFromNowIso(randInt(3, 28)) : daysFromNowIso(randInt(60, 400)),
      pucExpiry: pucSoon ? daysFromNowIso(randInt(3, 28)) : daysFromNowIso(randInt(60, 400)),
      fastagId: `FASTAG-${randInt(100000000000, 999999999999)}`,
      fastagBalance: Math.round(rand(50, 3000)),
    });
    if (retired) {
      const v = await getVehicleByRegistration(reg);
      if (v) await setVehicleStatus(v.id, "RETIRED");
    }
  }

  console.log("Seeding ~30 additional drivers...");
  const bulkDriverCount = 30;
  const bulkDriverLicenses: string[] = [];
  for (let i = 0; i < bulkDriverCount; i++) {
    const name = `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
    const license = `DL-2${String(100 + i).padStart(3, "0")}`;
    const expiringSoon = i % 8 === 0;
    const alreadyExpired = i % 15 === 0;
    const expiry = alreadyExpired
      ? daysAgoIso(randInt(1, 60))
      : expiringSoon
        ? daysFromNowIso(randInt(3, 28))
        : daysFromNowIso(randInt(90, 700));
    await ensureDriver({
      name,
      licenseNumber: license,
      licenseCategory: pick(["LMV", "HMV", "LMV", "HMV", "MCWG"]),
      licenseExpiryDate: expiry,
      contactNumber: `98${randInt(10000000, 99999999)}`,
      safetyScore: randInt(45, 100),
    });
    bulkDriverLicenses.push(license);
  }
  // Suspend a couple of drivers for the Safety Officer dashboard demo.
  for (const license of bulkDriverLicenses.slice(0, 3)) {
    const d = await getDriverByLicenseNumber(license);
    if (d) {
      await db.prepare("UPDATE drivers SET status = 'SUSPENDED' WHERE id = ?").run(d.id);
    }
  }

  console.log("Seeding 40-60 trips over the last 30 days...");
  const tripCount = randInt(40, 60);
  let created = 0;
  let attempts = 0;
  const maxAttempts = tripCount * 8;

  while (created < tripCount && attempts < maxAttempts) {
    attempts++;
    const availableVehicles = await listVehicles({ status: "AVAILABLE" });
    const allAvailableDrivers = await listDrivers({ status: "AVAILABLE" });
    const availableDrivers = allAvailableDrivers.filter(
      (d) => new Date(d.license_expiry_date).getTime() > Date.now()
    );
    if (availableVehicles.length === 0 || availableDrivers.length === 0) break;

    const vehicle = pick(availableVehicles);
    const driver = pick(availableDrivers);
    const cargoWeight = Math.round(rand(50, vehicle.max_load_capacity * 0.9));
    const plannedDistance = randInt(20, 900);
    const source = pick(CITIES);
    let destination = pick(CITIES);
    while (destination === source) destination = pick(CITIES);

    let trip;
    try {
      trip = await createTrip({
        source,
        destination,
        vehicleId: vehicle.id,
        driverId: driver.id,
        cargoWeight,
        plannedDistance,
      });
    } catch {
      continue;
    }

    const outcome = Math.random();
    const backdatedDays = randInt(0, 29);
    const createdIso = daysAgoIso(backdatedDays);

    if (outcome < 0.5) {
      // Completed trip, backdated realistically.
      await dispatchTrip(trip.id);
      const actualDistance = Math.round(plannedDistance * rand(0.9, 1.12));
      const fuelConsumed = Math.round(actualDistance * rand(0.08, 0.18) * 10) / 10;
      await completeTrip(trip.id, { actualDistance, fuelConsumed });
      const dispatchedIso = daysAgoIso(Math.max(backdatedDays - 1, 0));
      const completedIso = daysAgoIso(Math.max(backdatedDays - 2, 0));
      await db.prepare(
        "UPDATE trips SET created_at = ?, dispatched_at = ?, completed_at = ? WHERE id = ?"
      ).run(toSqlDatetime(createdIso), toSqlDatetime(dispatchedIso), toSqlDatetime(completedIso), trip.id);
    } else if (outcome < 0.68) {
      // Currently dispatched (in progress) — keep it recent.
      await dispatchTrip(trip.id);
      const recentIso = daysAgoIso(randInt(0, 2));
      await db.prepare("UPDATE trips SET created_at = ?, dispatched_at = ? WHERE id = ?").run(
        toSqlDatetime(recentIso),
        toSqlDatetime(recentIso),
        trip.id
      );
    } else if (outcome < 0.85) {
      // Cancelled after dispatch, or straight from draft.
      if (Math.random() < 0.5) await dispatchTrip(trip.id);
      await cancelTrip(trip.id);
      await db.prepare("UPDATE trips SET created_at = ? WHERE id = ?").run(toSqlDatetime(createdIso), trip.id);
    } else {
      // Left as Draft/pending.
      await db.prepare("UPDATE trips SET created_at = ? WHERE id = ?").run(toSqlDatetime(createdIso), trip.id);
    }

    created++;
  }
  console.log(`  created ${created} trips`);

  console.log("Seeding fuel logs and expenses...");
  const allVehicles = await listVehicles();
  let fuelCount = 0;
  let expenseCount = 0;
  for (const v of allVehicles) {
    if (v.status === "RETIRED") continue;
    const logsForVehicle = randInt(0, 4);
    for (let i = 0; i < logsForVehicle; i++) {
      const liters = Math.round(rand(15, 120) * 10) / 10;
      const cost = Math.round(liters * rand(90, 105));
      await createFuelLog({ vehicleId: v.id, liters, cost, date: toSqlDatetime(daysAgoIso(randInt(0, 29))) });
      fuelCount++;
    }
    if (Math.random() < 0.35) {
      const types = ["Toll", "Permit Renewal", "Driver Allowance", "Parking", "Insurance Premium"];
      await createExpense({
        vehicleId: v.id,
        type: pick(types),
        amount: Math.round(rand(500, 15000)),
        date: toSqlDatetime(daysAgoIso(randInt(0, 29))),
        description: null,
      });
      expenseCount++;
    }
  }
  console.log(`  created ${fuelCount} fuel logs, ${expenseCount} expenses`);

  console.log("Seeding maintenance records...");
  let maintenanceCount = 0;
  const stillAvailable = await listVehicles({ status: "AVAILABLE" });
  const maintenanceTargets = stillAvailable.slice(0, Math.min(15, stillAvailable.length));
  const descriptions = [
    "Routine oil change and filter replacement",
    "Brake pad replacement",
    "Tyre rotation and alignment",
    "AC system service",
    "Suspension check",
    "Battery replacement",
    "Clutch overhaul",
    "Electrical wiring inspection",
  ];
  for (const v of maintenanceTargets) {
    const record = await createMaintenanceRecord({
      vehicleId: v.id,
      description: pick(descriptions),
      cost: Math.round(rand(800, 25000)),
    });
    const backdated = toSqlDatetime(daysAgoIso(randInt(2, 25)));
    await db.prepare("UPDATE maintenance_records SET created_at = ? WHERE id = ?").run(backdated, record.id);
    maintenanceCount++;
    // Close about 2/3 of them so some vehicles are back to Available and some remain In Shop.
    if (Math.random() < 0.66) {
      await closeMaintenanceRecord(record.id);
      const closedIso = toSqlDatetime(daysAgoIso(randInt(0, 1)));
      await db.prepare("UPDATE maintenance_records SET closed_at = ? WHERE id = ?").run(closedIso, record.id);
    }
  }
  console.log(`  created ${maintenanceCount} maintenance records`);

  console.log("Seeding sample traffic challans...");
  const challanTargets = allVehicles.filter((v) => v.status !== "RETIRED").slice(0, 6);
  const reasons = ["Overspeeding", "No parking zone", "Signal jump", "Lane violation", "Overloading"];
  let challanCount = 0;
  for (let i = 0; i < challanTargets.length; i++) {
    const v = challanTargets[i];
    const challan = await createChallan({
      vehicleId: v.id,
      challanNumber: `CH-${new Date().getFullYear()}-${1000 + i}`,
      reason: pick(reasons),
      amount: Math.round(rand(500, 5000)),
    });
    challanCount++;
    // Leave roughly half pending, half already paid, for a realistic mix.
    if (i % 2 === 0) {
      await db.prepare("UPDATE challans SET status = 'PAID', paid_date = datetime('now') WHERE id = ?").run(challan.id);
    }
  }
  console.log(`  created ${challanCount} challans`);

  console.log("Done.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => {
    db.close();
  });
