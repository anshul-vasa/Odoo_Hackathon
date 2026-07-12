import { NextRequest } from "next/server";
import { requireSession, apiOk, apiError } from "@/lib/api-helpers";
import { requireCan } from "@/lib/rbac";
import { getTripById } from "@/lib/repositories/trips";
import { NotFoundError } from "@/lib/errors";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireSession(req);
    requireCan(session.role, "trips", "read");
    const trip = await getTripById(params.id);
    if (!trip) throw new NotFoundError("Trip not found.");
    return apiOk({ trip });
  } catch (err) {
    return apiError(err);
  }
}
