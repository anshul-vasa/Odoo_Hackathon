import { NextRequest } from "next/server";
import { requireSession, apiOk, apiError } from "@/lib/api-helpers";
import { requireCan } from "@/lib/rbac";
import { deleteExpense } from "@/lib/repositories/expenses";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireSession(req);
    requireCan(session.role, "fuel", "write");
    deleteExpense(params.id);
    return apiOk({ ok: true });
  } catch (err) {
    return apiError(err);
  }
}
