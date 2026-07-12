import { NextRequest } from "next/server";
import { requireSession, apiOk, apiError } from "@/lib/api-helpers";
import { requireCan } from "@/lib/rbac";
import { deleteFuelLog } from "@/lib/repositories/fuel";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireSession(req);
    requireCan(session.role, "fuel", "write");
    await deleteFuelLog(params.id);
    return apiOk({ ok: true });
  } catch (err) {
    return apiError(err);
  }
}
