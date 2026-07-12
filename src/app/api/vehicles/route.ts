import { NextRequest } from "next/server";
import { z } from "zod";
import { requireSession, apiOk, apiError } from "@/lib/api-helpers";
import { requireCan } from "@/lib/rbac";
import {
  listVehicles,
  createVehicle,
  getVehicleByRegistration,
} from "@/lib/repositories/vehicles";
import { ValidationError } from "@/lib/errors";

const CreateVehicleSchema = z.object({
  registrationNumber: z.string().min(1),
  name: z.string().min(1),
  type: z.string().min(1),
  maxLoadCapacity: z.number().positive(),
  odometer: z.number().min(0).optional(),
  acquisitionCost: z.number().min(0),
  region: z.string().optional(),
  chassisNumber: z.string().optional(),
  insuranceExpiry: z.string().optional(),
  pucExpiry: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await requireSession(req);
    requireCan(session.role, "vehicles", "read");

    const { searchParams } = new URL(req.url);
    const vehicles = await listVehicles({
      type: searchParams.get("type") ?? undefined,
      status: (searchParams.get("status") as any) ?? undefined,
      region: searchParams.get("region") ?? undefined,
    });
    return apiOk({ vehicles });
  } catch (err) {
    return apiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession(req);
    requireCan(session.role, "vehicles", "write");

    const body = CreateVehicleSchema.parse(await req.json());
    if (await getVehicleByRegistration(body.registrationNumber)) {
      throw new ValidationError(
        `Registration number ${body.registrationNumber} is already in use.`
      );
    }
    const vehicle = await createVehicle(body);
    return apiOk({ vehicle }, 201);
  } catch (err) {
    return apiError(err);
  }
}
