import { NextRequest } from "next/server";
import { getSession } from "@/lib/api-helpers";
import { apiOk } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  const session = await getSession(req);
  return apiOk({ user: session });
}
