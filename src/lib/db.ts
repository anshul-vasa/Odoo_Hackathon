import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";

// Node's built-in SQLite (Node >= 22.5). Chosen deliberately over Prisma/better-sqlite3
// for this project: zero native-binary downloads, zero external engine downloads,
// works identically on every teammate's machine and in restricted-network CI/sandboxes.
// Requires Node >= 22.5 — see .nvmrc and package.json "engines".

declare global {
  // eslint-disable-next-line no-var
  var __transitopsDb: DatabaseSync | undefined;
}

function initDb(): DatabaseSync {
  // Overridable so the automated test suite (tests/*.test.ts) can point at a
  // throwaway file instead of the real dev database. Unset in normal app use.
  const dbPath = process.env.TRANSITOPS_DB_PATH
    ? path.resolve(process.env.TRANSITOPS_DB_PATH)
    : path.join(process.cwd(), "data", "transitops.db");
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });

  const db = new DatabaseSync(dbPath);
  db.exec("PRAGMA foreign_keys = ON;");
  db.exec("PRAGMA journal_mode = WAL;");

  const schemaPath = path.join(process.cwd(), "db", "schema.sql");
  const schema = fs.readFileSync(schemaPath, "utf-8");
  db.exec(schema);

  runMigrations(db);

  return db;
}

// Lightweight forward-migrations for columns added after a teammate's DB file
// already existed. CREATE TABLE IF NOT EXISTS won't add columns to an existing
// table, so new columns are added here defensively (ignoring "duplicate
// column" errors on databases that already have them).
function runMigrations(db: DatabaseSync) {
  const alters = [
    "ALTER TABLE vehicles ADD COLUMN chassis_number TEXT",
    "ALTER TABLE vehicles ADD COLUMN insurance_expiry TEXT",
    "ALTER TABLE vehicles ADD COLUMN puc_expiry TEXT",
    "ALTER TABLE vehicles ADD COLUMN fastag_id TEXT",
    "ALTER TABLE vehicles ADD COLUMN fastag_balance REAL DEFAULT 0",
  ];
  for (const sql of alters) {
    try {
      db.exec(sql);
    } catch {
      // column already exists — fine
    }
  }
}

// Reuse a single connection across hot reloads in dev.
export const db: DatabaseSync = global.__transitopsDb ?? initDb();
if (process.env.NODE_ENV !== "production") {
  global.__transitopsDb = db;
}

// node:sqlite returns rows as objects with a null prototype
// ([Object: null prototype] { ... }). That's fine for server-only use, but Next.js
// refuses to serialize null-prototype objects across the Server->Client Component
// boundary ("Only plain objects... can be passed to Client Components"). These
// helpers normalize every row into a genuine plain object once, at the data-access
// boundary, so every repository function is safe to use from anywhere.
export function toRow<T>(record: unknown): T | undefined {
  return record ? ({ ...(record as object) } as T) : undefined;
}

export function toRows<T>(records: unknown[]): T[] {
  return records.map((r) => ({ ...(r as object) })) as T[];
}
