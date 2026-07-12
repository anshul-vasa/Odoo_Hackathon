import { db, toRow, toRows } from "@/lib/db";
import { newId } from "@/lib/id";
import type { Role, User } from "@/lib/types";

export async function getUserByEmail(email: string): Promise<User | undefined> {
  return toRow<User>(await db.prepare("SELECT * FROM users WHERE email = ?").get(email));
}

export async function getUserById(id: string): Promise<User | undefined> {
  return toRow<User>(await db.prepare("SELECT * FROM users WHERE id = ?").get(id));
}

export async function createUser(input: {
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
}): Promise<User> {
  const id = newId("usr");
  await db.prepare(
    "INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)"
  ).run(id, input.name, input.email, input.passwordHash, input.role);
  return (await getUserById(id))!;
}

export async function listUsers(): Promise<User[]> {
  return toRows<User>(
    await db.prepare("SELECT * FROM users ORDER BY created_at DESC").all()
  );
}
