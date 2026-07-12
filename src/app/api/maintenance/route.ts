import { NextRequest } from "next/server";
import { z } from "zod";
import { requireSession, apiOk, apiError } from "@/lib/api-helpers";
import { requireCan } from "@/lib/rbac";
import {
  listMaintenanceRecords,
  createMaintenanceRecord,
} from "@/lib/repositories/maintenance";

const CreateMaintenanceSchema = z.object({
  vehicleId: z.string().min(1),
  description: z.string().min(1),
  cost: z.number().min(0).optional(),
});

// Minimal, functional stub: enough to prove the "creating maintenance -> vehicle
// In Shop" automatic status transition end-to-end. Teammate extends this into
// the full Maintenance Management screen (priority, technician assignment, etc).
export async function GET(req: NextRequest) {
  try {
    const session = await requireSession(req);
    requireCan(session.role, "maintenance", "read");
    const { searchParams } = new URL(req.url);
    const vehicleId = searchParams.get("vehicleId") ?? undefined;
    const records = listMaintenanceRecords(vehicleId);
    return apiOk({ records });
  } catch (err) {
    return apiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession(req);
    requireCan(session.role, "maintenance", "write");
    const body = CreateMaintenanceSchema.parse(await req.json());
    const record = createMaintenanceRecord(body);
    return apiOk({ record }, 201);
  } catch (err) {
    return apiError(err);
  }
}
