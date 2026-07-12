import { NextRequest } from "next/server";
import { requireSession, apiOk, apiError } from "@/lib/api-helpers";
import { requireCan } from "@/lib/rbac";
import { createDriver, getDriverByLicenseNumber } from "@/lib/repositories/drivers";

interface ImportRow {
  [key: string]: string;
}

function num(v: string | undefined): number | undefined {
  if (v === undefined || v.trim() === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function str(v: string | undefined): string | undefined {
  const s = v?.trim();
  return s ? s : undefined;
}

// Accepts rows shaped like: name, licenseNumber, licenseCategory,
// licenseExpiryDate, contactNumber, safetyScore (optional).
export async function POST(req: NextRequest) {
  try {
    const session = await requireSession(req);
    requireCan(session.role, "drivers", "write");

    const body = (await req.json()) as { rows: ImportRow[] };
    const rows = Array.isArray(body.rows) ? body.rows : [];

    let successCount = 0;
    const errors: { row: number; message: string }[] = [];

    for (let idx = 0; idx < rows.length; idx++) {
      const raw = rows[idx];
      const rowNum = idx + 2;
      try {
        const name = str(raw.name ?? raw["Name"]);
        const licenseNumber = str(raw.licenseNumber ?? raw["License #"] ?? raw["license_number"]);
        const licenseCategory = str(raw.licenseCategory ?? raw["Category"] ?? raw["license_category"]);
        const licenseExpiryDate = str(raw.licenseExpiryDate ?? raw["License Expiry"] ?? raw["license_expiry_date"]);
        const contactNumber = str(raw.contactNumber ?? raw["Contact"] ?? raw["contact_number"]);
        const safetyScore = num(raw.safetyScore ?? raw["Safety Score"]);

        if (!name) throw new Error("Missing name.");
        if (!licenseNumber) throw new Error("Missing license number.");
        if (!licenseCategory) throw new Error("Missing license category.");
        if (!licenseExpiryDate || Number.isNaN(new Date(licenseExpiryDate).getTime())) {
          throw new Error("Missing or invalid license expiry date.");
        }
        if (!contactNumber) throw new Error("Missing contact number.");
        if (await getDriverByLicenseNumber(licenseNumber)) {
          throw new Error(`License number ${licenseNumber} already exists.`);
        }

        await createDriver({
          name,
          licenseNumber,
          licenseCategory,
          licenseExpiryDate: new Date(licenseExpiryDate).toISOString(),
          contactNumber,
          safetyScore,
        });
        successCount++;
      } catch (err) {
        errors.push({ row: rowNum, message: err instanceof Error ? err.message : "Unknown error." });
      }
    }

    return apiOk({ successCount, errorCount: errors.length, errors });
  } catch (err) {
    return apiError(err);
  }
}
