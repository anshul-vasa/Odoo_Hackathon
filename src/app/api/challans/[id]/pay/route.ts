import { NextRequest } from "next/server";
import { requireSession, apiOk, apiError } from "@/lib/api-helpers";
import { requireCan } from "@/lib/rbac";
import { markChallanPaid } from "@/lib/repositories/challans";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireSession(req);
    requireCan(session.role, "vehicles", "write");
    const challan = await markChallanPaid(params.id);
    return apiOk({ challan });
  } catch (err) {
    return apiError(err);
  }
}
