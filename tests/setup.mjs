// Preload for `npm test` (see package.json). Runs to completion before the
// test files' own module graph loads, so this is the one safe place to point
// TRANSITOPS_DB_PATH at a throwaway file and guarantee a clean slate — doing
// this inside the test file itself would race against ESM import hoisting.
import fs from "node:fs";
import path from "node:path";

const dbPath = path.resolve("data", "test-transitops.db");
process.env.TRANSITOPS_DB_PATH = dbPath;

for (const suffix of ["", "-wal", "-shm"]) {
  fs.rmSync(dbPath + suffix, { force: true });
}
