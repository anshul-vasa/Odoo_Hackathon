import { NextRequest } from "next/server";
import { z } from "zod";
import { requireSession, apiOk, apiError } from "@/lib/api-helpers";
import { requireCan } from "@/lib/rbac";
import {
  getVehicleById,
  updateVehicle,
  deleteVehicle,
  getVehicleByRegistration,
} from "@/lib/repositories/vehicles";
import { NotFoundError, ValidationError } from "@/lib/errors";

const UpdateVehicleSchema = z.object({
  name: z.string().min(1).optional(),
  type: z.string().min(1).optional(),
  maxLoadCapacity: z.number().positive().optional(),
  odometer: z.number().min(0).optional(),
  acquisitionCost: z.number().min(0).optional(),
  region: z.string().nullable().optional(),
  chassisNumber: z.string().nullable().optional(),
  insuranceExpiry: z.string().nullable().optional(),
  pucExpiry: z.string().nullable().optional(),
  fastagId: z.string().nullable().optional(),
  fastagBalance: z.number().nullable().optional(),
  status: z.enum(["AVAILABLE", "ON_TRIP", "IN_SHOP", "RETIRED"]).optional(),
  registrationNumber: z.string().min(1).optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireSession(req);
    requireCan(session.role, "vehicles", "read");
    const vehicle = await getVehicleById(params.id);
    if (!vehicle) throw new NotFoundError("Vehicle not found.");
    return apiOk({ vehicle });
  } catch (err) {
    return apiError(err);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireSession(req);
    requireCan(session.role, "vehicles", "write");

    const existing = await getVehicleById(params.id);
    if (!existing) throw new NotFoundError("Vehicle not found.");

    const body = UpdateVehicleSchema.parse(await req.json());
    if (
      body.registrationNumber &&
      body.registrationNumber !== existing.registration_number
    ) {
      const clash = await getVehicleByRegistration(body.registrationNumber);
      if (clash) {
        throw new ValidationError(
          `Registration number ${body.registrationNumber} is already in use.`
        );
      }
    }

    const vehicle = await updateVehicle(params.id, body);
    return apiOk({ vehicle });
  } catch (err) {
    return apiError(err);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireSession(req);
    requireCan(session.role, "vehicles", "write");
    const existing = await getVehicleById(params.id);
    if (!existing) throw new NotFoundError("Vehicle not found.");
    await deleteVehicle(params.id);
    return apiOk({ ok: true });
  } catch (err) {
    return apiError(err);
  }
}
