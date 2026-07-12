-- TransitOps schema (SQLite via Node's built-in node:sqlite)
-- Mirrors the "Expected Database Entities" in the spec: Users, Roles, Vehicles,
-- Drivers, Trips, Maintenance Logs, Fuel Logs, Expenses.

CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL CHECK (role IN ('FLEET_MANAGER','DRIVER','SAFETY_OFFICER','FINANCIAL_ANALYST')),
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS vehicles (
  id                   TEXT PRIMARY KEY,
  registration_number  TEXT NOT NULL UNIQUE,
  name                 TEXT NOT NULL,
  type                 TEXT NOT NULL,
  max_load_capacity    REAL NOT NULL,
  odometer             REAL NOT NULL DEFAULT 0,
  acquisition_cost     REAL NOT NULL,
  region               TEXT,
  chassis_number       TEXT,
  insurance_expiry     TEXT,
  puc_expiry           TEXT,
  status               TEXT NOT NULL DEFAULT 'AVAILABLE'
                         CHECK (status IN ('AVAILABLE','ON_TRIP','IN_SHOP','RETIRED')),
  created_at           TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at           TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS drivers (
  id                  TEXT PRIMARY KEY,
  name                TEXT NOT NULL,
  license_number      TEXT NOT NULL UNIQUE,
  license_category    TEXT NOT NULL,
  license_expiry_date TEXT NOT NULL,
  contact_number      TEXT NOT NULL,
  safety_score        INTEGER NOT NULL DEFAULT 100,
  status              TEXT NOT NULL DEFAULT 'AVAILABLE'
                        CHECK (status IN ('AVAILABLE','ON_TRIP','OFF_DUTY','SUSPENDED')),
  user_id             TEXT UNIQUE REFERENCES users(id),
  created_at          TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at          TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS trips (
  id               TEXT PRIMARY KEY,
  source           TEXT NOT NULL,
  destination      TEXT NOT NULL,
  cargo_weight     REAL NOT NULL,
  planned_distance REAL NOT NULL,
  actual_distance  REAL,
  fuel_consumed    REAL,
  status           TEXT NOT NULL DEFAULT 'DRAFT'
                     CHECK (status IN ('DRAFT','DISPATCHED','COMPLETED','CANCELLED')),
  vehicle_id       TEXT NOT NULL REFERENCES vehicles(id),
  driver_id        TEXT NOT NULL REFERENCES drivers(id),
  created_at       TEXT NOT NULL DEFAULT (datetime('now')),
  dispatched_at    TEXT,
  completed_at     TEXT,
  cancelled_at     TEXT
);

CREATE TABLE IF NOT EXISTS maintenance_records (
  id          TEXT PRIMARY KEY,
  vehicle_id  TEXT NOT NULL REFERENCES vehicles(id),
  description TEXT NOT NULL,
  cost        REAL NOT NULL DEFAULT 0,
  status      TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN','CLOSED')),
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  closed_at   TEXT
);

CREATE TABLE IF NOT EXISTS fuel_logs (
  id         TEXT PRIMARY KEY,
  vehicle_id TEXT NOT NULL REFERENCES vehicles(id),
  liters     REAL NOT NULL,
  cost       REAL NOT NULL,
  date       TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS expenses (
  id          TEXT PRIMARY KEY,
  vehicle_id  TEXT NOT NULL REFERENCES vehicles(id),
  type        TEXT NOT NULL,
  amount      REAL NOT NULL,
  date        TEXT NOT NULL DEFAULT (datetime('now')),
  description TEXT
);

CREATE TABLE IF NOT EXISTS challans (
  id             TEXT PRIMARY KEY,
  vehicle_id     TEXT NOT NULL REFERENCES vehicles(id),
  challan_number TEXT NOT NULL,
  reason         TEXT NOT NULL,
  amount         REAL NOT NULL,
  status         TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','PAID')),
  issued_date    TEXT NOT NULL DEFAULT (datetime('now')),
  paid_date      TEXT,
  created_at     TEXT NOT NULL DEFAULT (datetime('now'))
);

-- One invoice per trip: GST-style billing (taxable amount + CGST/SGST or
-- IGST split) plus e-way bill tracking, surfaced in the Trips section per
-- the team's request rather than as a separate top-level module.
CREATE TABLE IF NOT EXISTS invoices (
  id                    TEXT PRIMARY KEY,
  trip_id               TEXT NOT NULL UNIQUE REFERENCES trips(id),
  invoice_number        TEXT NOT NULL UNIQUE,
  taxable_amount        REAL NOT NULL,
  gst_rate              REAL NOT NULL,
  tax_type              TEXT NOT NULL CHECK (tax_type IN ('CGST_SGST','IGST')),
  cgst_amount           REAL NOT NULL DEFAULT 0,
  sgst_amount           REAL NOT NULL DEFAULT 0,
  igst_amount           REAL NOT NULL DEFAULT 0,
  total_amount          REAL NOT NULL,
  eway_bill_number      TEXT NOT NULL,
  eway_bill_valid_until TEXT NOT NULL,
  eway_bill_required    INTEGER NOT NULL DEFAULT 0,
  created_at            TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_trips_vehicle ON trips(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_trips_driver ON trips(driver_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_vehicle ON maintenance_records(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_fuel_vehicle ON fuel_logs(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_expenses_vehicle ON expenses(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_challans_vehicle ON challans(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_invoices_trip ON invoices(trip_id);
