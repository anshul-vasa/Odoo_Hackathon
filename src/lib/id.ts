import { randomBytes } from "node:crypto";

// Short, sortable-ish, collision-safe id without extra deps.
export function newId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}${randomBytes(6).toString("hex")}`;
}
