import { db } from "@/lib/db";

// node:sqlite's DatabaseSync has no built-in `.transaction()` helper (unlike
// better-sqlite3), so we wrap BEGIN/COMMIT/ROLLBACK manually. All calls here are
// synchronous, and JS is single-threaded with no `await` inside `fn`, so no other
// request can interleave mid-transaction.
export function withTransaction<T>(fn: () => T): T {
  db.exec("BEGIN IMMEDIATE");
  try {
    const result = fn();
    db.exec("COMMIT");
    return result;
  } catch (err) {
    db.exec("ROLLBACK");
    throw err;
  }
}
