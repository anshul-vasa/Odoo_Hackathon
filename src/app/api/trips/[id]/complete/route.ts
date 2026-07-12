import { NextRequest } from "next/server";
import { z } from "zod";
import { requireSession, apiOk, apiError } from "@/lib/api-helpers";
import { requireCan } from "@/lib/rbac";
import { completeTrip } from "@/lib/repositories/trips";

const CompleteTripSchema = z.object({
  actualDistance: z.number().min(0),
  fuelConsumed: z.number().min(0),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireSession(req);
    requireCan(session.role, "trips", "write");
    const body = CompleteTripSchema.parse(await req.json());
    const trip = await completeTrip(params.id, body);
    return apiOk({ trip });
  } catch (err) {
    return apiError(err);
  }
}
