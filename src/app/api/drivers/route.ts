import { NextRequest } from "next/server";
import { z } from "zod";
import { requireSession, apiOk, apiError } from "@/lib/api-helpers";
import { requireCan } from "@/lib/rbac";
import {
  listDrivers,
  createDriver,
  getDriverByLicenseNumber,
} from "@/lib/repositories/drivers";
import { ValidationError } from "@/lib/errors";

const CreateDriverSchema = z.object({
  name: z.string().min(1),
  licenseNumber: z.string().min(1),
  licenseCategory: z.string().min(1),
  licenseExpiryDate: z.string().min(1), // ISO date string
  contactNumber: z.string().min(1),
  safetyScore: z.number().min(0).max(100).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await requireSession(req);
    requireCan(session.role, "drivers", "read");

    const { searchParams } = new URL(req.url);
    const drivers = listDrivers({
      status: (searchParams.get("status") as any) ?? undefined,
    });
    return apiOk({ drivers });
  } catch (err) {
    return apiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession(req);
    requireCan(session.role, "drivers", "write");

    const body = CreateDriverSchema.parse(await req.json());
    if (getDriverByLicenseNumber(body.licenseNumber)) {
      throw new ValidationError(
        `License number ${body.licenseNumber} is already registered.`
      );
    }
    const driver = createDriver(body);
    return apiOk({ driver }, 201);
  } catch (err) {
    return apiError(err);
  }
}
