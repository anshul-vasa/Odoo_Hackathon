import { NextRequest } from "next/server";
import { z } from "zod";
import { requireSession, apiOk, apiError } from "@/lib/api-helpers";
import { requireCan } from "@/lib/rbac";
import { createChallan, listChallans } from "@/lib/repositories/challans";

const CreateChallanSchema = z.object({
  challanNumber: z.string().min(1),
  reason: z.string().min(1),
  amount: z.number().positive(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireSession(req);
    requireCan(session.role, "vehicles", "read");
    const challans = listChallans(params.id);
    return apiOk({ challans });
  } catch (err) {
    return apiError(err);
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireSession(req);
    requireCan(session.role, "vehicles", "write");
    const body = CreateChallanSchema.parse(await req.json());
    const challan = createChallan({ vehicleId: params.id, ...body });
    return apiOk({ challan }, 201);
  } catch (err) {
    return apiError(err);
  }
}
