import { NextRequest } from "next/server";
import { requireSession, apiOk, apiError } from "@/lib/api-helpers";
import { requireCan } from "@/lib/rbac";
import { closeMaintenanceRecord } from "@/lib/repositories/maintenance";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireSession(req);
    requireCan(session.role, "maintenance", "write");
    const record = closeMaintenanceRecord(params.id);
    return apiOk({ record });
  } catch (err) {
    return apiError(err);
  }
}
