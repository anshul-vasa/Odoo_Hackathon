import { NextRequest } from "next/server";
import { z } from "zod";
import { requireSession, apiOk, apiError } from "@/lib/api-helpers";
import { requireCan } from "@/lib/rbac";
import { listFuelLogs, createFuelLog } from "@/lib/repositories/fuel";

const CreateFuelLogSchema = z.object({
  vehicleId: z.string().min(1),
  liters: z.number().positive(),
  cost: z.number().min(0),
  date: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await requireSession(req);
    requireCan(session.role, "fuel", "read");
    const { searchParams } = new URL(req.url);
    const vehicleId = searchParams.get("vehicleId") ?? undefined;
    const logs = listFuelLogs(vehicleId);
    return apiOk({ logs });
  } catch (err) {
    return apiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession(req);
    requireCan(session.role, "fuel", "write");
    const body = CreateFuelLogSchema.parse(await req.json());
    const log = createFuelLog(body);
    return apiOk({ log }, 201);
  } catch (err) {
    return apiError(err);
  }
}
