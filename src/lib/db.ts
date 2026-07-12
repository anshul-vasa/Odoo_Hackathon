import { createClient, type Client, type InValue, type Row } from "@libsql/client";
import fs from "node:fs";
import path from "node:path";

// --- Data layer ---------------------------------------------------------
// Originally built on Node's built-in `node:sqlite` (synchronous, local-file
// only) to avoid native-binary downloads in restricted sandboxes. Netlify
// Functions run in ephemeral containers with no reliable persistent local
// filesystem, so a local-file-only database can't survive in production
// there. Migrated to `@libsql/client` (the libSQL/Turso driver): it speaks
// the same SQLite dialect, so the schema and almost all queries are
// unchanged, but the client is async and can point at either:
//   - a local `file:` database (dev, and this sandbox — zero setup), or
//   - a remote Turso database over `libsql://`/`https://` (production on
//     Netlify), selected automatically via TURSO_DATABASE_URL/TURSO_AUTH_TOKEN.
// See README.md "Deploying to Netlify" for the one manual step this needs
// (a free Turso database + two environment variables).

declare global {
  // eslint-disable-next-line no-var
  var __transitopsClient: Client | undefined;
  // eslint-disable-next-line no-var
  var __transitopsReady: Promise<void> | undefined;
}

function createDbClient(): Client {
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  if (tursoUrl) {
    return createClient({ url: tursoUrl, authToken: process.env.TURSO_AUTH_TOKEN });
  }

  // Local file mode — used in dev, in this sandbox, and by the test suite
  // (TRANSITOPS_DB_PATH override; see tests/setup.mjs).
  const dbPath = process.env.TRANSITOPS_DB_PATH
    ? path.resolve(process.env.TRANSITOPS_DB_PATH)
    : path.join(process.cwd(), "data", "transitops.db");
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  return createClient({ url: `file:${dbPath}` });
}

const client: Client = global.__transitopsClient ?? createDbClient();
if (process.env.NODE_ENV !== "production") {
  global.__transitopsClient = client;
}

// Lightweight forward-migrations for columns added after a teammate's DB
// already existed. CREATE TABLE IF NOT EXISTS won't add columns to an
// existing table, so new columns are added here defensively (ignoring
// "duplicate column" errors on databases that already have them).
const MIGRATIONS = [
  "ALTER TABLE vehicles ADD COLUMN chassis_number TEXT",
  "ALTER TABLE vehicles ADD COLUMN insurance_expiry TEXT",
  "ALTER TABLE vehicles ADD COLUMN puc_expiry TEXT",
  "ALTER TABLE vehicles ADD COLUMN fastag_id TEXT",
  "ALTER TABLE vehicles ADD COLUMN fastag_balance REAL DEFAULT 0",
];

async function initialize(): Promise<void> {
  try {
    await client.execute("PRAGMA foreign_keys = ON;");
  } catch {
    // Not every libSQL backend (e.g. remote Turso over HTTP) supports every
    // PRAGMA — safe to ignore, foreign key enforcement is a defense-in-depth
    // extra, not something the app logic depends on.
  }

  const schemaPath = path.join(process.cwd(), "db", "schema.sql");
  const schema = fs.readFileSync(schemaPath, "utf-8");
  await client.executeMultiple(schema);

  for (const sql of MIGRATIONS) {
    try {
      await client.execute(sql);
    } catch {
      // column already exists — fine
    }
  }
}

// Memoized so concurrent early requests all await the same one-time setup
// instead of racing to run the schema/migrations multiple times.
function ready(): Promise<void> {
  if (!global.__transitopsReady) {
    global.__transitopsReady = initialize();
  }
  return global.__transitopsReady;
}

function rowToObject<T>(row: Row, columns: string[]): T {
  const obj: Record<string, unknown> = {};
  for (const col of columns) obj[col] = (row as unknown as Record<string, unknown>)[col];
  return obj as T;
}

export interface RunResult {
  lastInsertRowid: bigint | undefined;
  changes: number;
}

// A thin shim preserving the familiar `db.prepare(sql).get/all/run(...params)`
// call shape from the old synchronous driver, just made async — this kept
// the migration to every repository file mechanical (add `async`/`await`)
// instead of rewriting every query's plumbing.
export const db = {
  prepare(sql: string) {
    return {
      async get<T = unknown>(...params: InValue[]): Promise<T | undefined> {
        await ready();
        const rs = await client.execute({ sql, args: params });
        return rs.rows[0] ? rowToObject<T>(rs.rows[0], rs.columns) : undefined;
      },
      async all<T = unknown>(...params: InValue[]): Promise<T[]> {
        await ready();
        const rs = await client.execute({ sql, args: params });
        return rs.rows.map((r) => rowToObject<T>(r, rs.columns));
      },
      async run(...params: InValue[]): Promise<RunResult> {
        await ready();
        const rs = await client.execute({ sql, args: params });
        return { lastInsertRowid: rs.lastInsertRowid, changes: rs.rowsAffected };
      },
    };
  },
  async exec(sql: string): Promise<void> {
    await ready();
    await client.executeMultiple(sql);
  },
  // For single, param-less control statements (BEGIN/COMMIT/ROLLBACK).
  // `executeMultiple` (used by `exec` above, for schema.sql) runs its own
  // implicit statement-batching that doesn't compose with a manually-managed
  // ambient transaction the way a single `execute()` call does — using it for
  // BEGIN/COMMIT/ROLLBACK caused "cannot rollback - no transaction is active"
  // errors even when a transaction really was active.
  async raw(sql: string): Promise<void> {
    await ready();
    await client.execute(sql);
  },
  close(): void {
    client.close();
  },
};

// These previously normalized node:sqlite's null-prototype row objects into
// genuine plain objects (required for Next.js's Server->Client Component
// serialization boundary). The libSQL shim above already returns plain
// objects built field-by-field, so these are now no-ops kept only so every
// repository file didn't need its imports touched.
export function toRow<T>(record: unknown): T | undefined {
  return record ? ({ ...(record as object) } as T) : undefined;
}

export function toRows<T>(records: unknown[]): T[] {
  return records.map((r) => ({ ...(r as object) })) as T[];
}
