import { NextRequest } from "next/server";
import { z } from "zod";
import { requireSession, apiOk, apiError } from "@/lib/api-helpers";
import { requireCan } from "@/lib/rbac";
import { listTrips, createTrip } from "@/lib/repositories/trips";

const CreateTripSchema = z.object({
  source: z.string().min(1),
  destination: z.string().min(1),
  vehicleId: z.string().min(1),
  driverId: z.string().min(1),
  cargoWeight: z.number().positive(),
  plannedDistance: z.number().positive(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await requireSession(req);
    requireCan(session.role, "trips", "read");
    const { searchParams } = new URL(req.url);
    const trips = listTrips({
      status: (searchParams.get("status") as any) ?? undefined,
    });
    return apiOk({ trips });
  } catch (err) {
    return apiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession(req);
    requireCan(session.role, "trips", "write");
    const body = CreateTripSchema.parse(await req.json());
    const trip = createTrip(body);
    return apiOk({ trip }, 201);
  } catch (err) {
    return apiError(err);
  }
}
