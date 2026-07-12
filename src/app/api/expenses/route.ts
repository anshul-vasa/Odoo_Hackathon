import { NextRequest } from "next/server";
import { z } from "zod";
import { requireSession, apiOk, apiError } from "@/lib/api-helpers";
import { requireCan } from "@/lib/rbac";
import { listExpenses, createExpense } from "@/lib/repositories/expenses";

const CreateExpenseSchema = z.object({
  vehicleId: z.string().min(1),
  type: z.string().min(1),
  amount: z.number().min(0),
  date: z.string().optional(),
  description: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await requireSession(req);
    requireCan(session.role, "fuel", "read");
    const { searchParams } = new URL(req.url);
    const vehicleId = searchParams.get("vehicleId") ?? undefined;
    const expenses = await listExpenses(vehicleId);
    return apiOk({ expenses });
  } catch (err) {
    return apiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession(req);
    requireCan(session.role, "fuel", "write");
    const body = CreateExpenseSchema.parse(await req.json());
    const expense = await createExpense(body);
    return apiOk({ expense }, 201);
  } catch (err) {
    return apiError(err);
  }
}
