import { NextRequest } from "next/server";
import { requireSession, apiOk, apiError } from "@/lib/api-helpers";
import { requireCan } from "@/lib/rbac";
import { dispatchTrip } from "@/lib/repositories/trips";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireSession(req);
    requireCan(session.role, "trips", "write");
    const trip = dispatchTrip(params.id);
    return apiOk({ trip });
  } catch (err) {
    return apiError(err);
  }
}
