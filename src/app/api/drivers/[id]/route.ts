import { NextRequest } from "next/server";
import { z } from "zod";
import { requireSession, apiOk, apiError } from "@/lib/api-helpers";
import { requireCan } from "@/lib/rbac";
import {
  getDriverById,
  updateDriver,
  deleteDriver,
  getDriverByLicenseNumber,
} from "@/lib/repositories/drivers";
import { NotFoundError, ValidationError } from "@/lib/errors";

const UpdateDriverSchema = z.object({
  name: z.string().min(1).optional(),
  licenseNumber: z.string().min(1).optional(),
  licenseCategory: z.string().min(1).optional(),
  licenseExpiryDate: z.string().min(1).optional(),
  contactNumber: z.string().min(1).optional(),
  safetyScore: z.number().min(0).max(100).optional(),
  status: z.enum(["AVAILABLE", "ON_TRIP", "OFF_DUTY", "SUSPENDED"]).optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireSession(req);
    requireCan(session.role, "drivers", "read");
    const driver = getDriverById(params.id);
    if (!driver) throw new NotFoundError("Driver not found.");
    return apiOk({ driver });
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
    requireCan(session.role, "drivers", "write");

    const existing = getDriverById(params.id);
    if (!existing) throw new NotFoundError("Driver not found.");

    const body = UpdateDriverSchema.parse(await req.json());
    if (body.licenseNumber && body.licenseNumber !== existing.license_number) {
      const clash = getDriverByLicenseNumber(body.licenseNumber);
      if (clash) {
        throw new ValidationError(
          `License number ${body.licenseNumber} is already registered.`
        );
      }
    }

    const driver = updateDriver(params.id, body);
    return apiOk({ driver });
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
    requireCan(session.role, "drivers", "write");
    const existing = getDriverById(params.id);
    if (!existing) throw new NotFoundError("Driver not found.");
    deleteDriver(params.id);
    return apiOk({ ok: true });
  } catch (err) {
    return apiError(err);
  }
}
