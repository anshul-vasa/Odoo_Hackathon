import { NextRequest } from "next/server";
import { z } from "zod";
import { requireSession, apiOk, apiError } from "@/lib/api-helpers";
import { requireCan } from "@/lib/rbac";
import { createInvoice, getInvoiceByTripId } from "@/lib/repositories/invoices";

const CreateInvoiceSchema = z.object({
  taxableAmount: z.number().positive(),
  gstRate: z.number(),
  taxType: z.enum(["CGST_SGST", "IGST"]),
});

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireSession(req);
    requireCan(session.role, "trips", "read");
    const invoice = getInvoiceByTripId(params.id);
    return apiOk({ invoice: invoice ?? null });
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
    requireCan(session.role, "trips", "write");
    const body = CreateInvoiceSchema.parse(await req.json());
    const invoice = createInvoice({ tripId: params.id, ...body });
    return apiOk({ invoice }, 201);
  } catch (err) {
    return apiError(err);
  }
}
