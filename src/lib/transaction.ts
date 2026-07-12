import { db } from "@/lib/db";

// The libSQL client is async, which reintroduces a risk the old synchronous
// node:sqlite version never had: two concurrent requests could each start a
// BEGIN before the other's COMMIT, corrupting the transaction on the shared
// connection. A tiny in-process mutex (a chained promise) serializes every
// withTransaction call within this server instance, restoring the exact same
// atomicity guarantee the original code relied on. (This protects a single
// server process — the realistic shape for this app's deployment — but not
// multiple concurrent serverless instances hitting the same remote database
// at once; that would need real row-level locking, out of scope here.)
let queue: Promise<unknown> = Promise.resolve();

export function withTransaction<T>(fn: () => Promise<T> | T): Promise<T> {
  const run = queue.then(async () => {
    await db.raw("BEGIN IMMEDIATE");
    try {
      const result = await fn();
      await db.raw("COMMIT");
      return result;
    } catch (err) {
      await db.raw("ROLLBACK");
      throw err;
    }
  });
  // Keep the queue alive even if this run rejects, so later calls still run.
  queue = run.catch(() => undefined);
  return run;
}
