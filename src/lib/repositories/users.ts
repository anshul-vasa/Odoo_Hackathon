import { db, toRow, toRows } from "@/lib/db";
import { newId } from "@/lib/id";
import type { Role, User } from "@/lib/types";

export function getUserByEmail(email: string): User | undefined {
  return toRow<User>(db.prepare("SELECT * FROM users WHERE email = ?").get(email));
}

export function getUserById(id: string): User | undefined {
  return toRow<User>(db.prepare("SELECT * FROM users WHERE id = ?").get(id));
}

export function createUser(input: {
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
}): User {
  const id = newId("usr");
  db.prepare(
    "INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)"
  ).run(id, input.name, input.email, input.passwordHash, input.role);
  return getUserById(id)!;
}

export function listUsers(): User[] {
  return toRows<User>(
    db.prepare("SELECT * FROM users ORDER BY created_at DESC").all()
  );
}
