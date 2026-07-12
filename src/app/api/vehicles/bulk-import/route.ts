import { NextRequest } from "next/server";
import { requireSession, apiOk, apiError } from "@/lib/api-helpers";
import { requireCan } from "@/lib/rbac";
import { createVehicle, getVehicleByRegistration } from "@/lib/repositories/vehicles";

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

// Accepts rows shaped like the exported vehicle template:
// registrationNumber, name, type, maxLoadCapacity, acquisitionCost, region,
// chassisNumber, insuranceExpiry, pucExpiry (odometer optional).
export async function POST(req: NextRequest) {
  try {
    const session = await requireSession(req);
    requireCan(session.role, "vehicles", "write");

    const body = (await req.json()) as { rows: ImportRow[] };
    const rows = Array.isArray(body.rows) ? body.rows : [];

    let successCount = 0;
    const errors: { row: number; message: string }[] = [];

    for (let idx = 0; idx < rows.length; idx++) {
      const raw = rows[idx];
      const rowNum = idx + 2; // +1 header row, +1 for 1-indexing
      try {
        const registrationNumber = str(raw.registrationNumber ?? raw["Vehicle Number"] ?? raw["registration_number"]);
        const name = str(raw.name ?? raw["Name"]);
        const type = str(raw.type ?? raw["Type"]);
        const maxLoadCapacity = num(raw.maxLoadCapacity ?? raw["Max Load"] ?? raw["max_load_capacity"]);
        const acquisitionCost = num(raw.acquisitionCost ?? raw["Acquisition Cost"] ?? raw["acquisition_cost"]);
        const region = str(raw.region ?? raw["City"] ?? raw["region"]);
        const chassisNumber = str(raw.chassisNumber ?? raw["Chassis Number"]);
        const insuranceExpiry = str(raw.insuranceExpiry ?? raw["Insurance Expiry"]);
        const pucExpiry = str(raw.pucExpiry ?? raw["PUC Expiry"]);

        if (!registrationNumber) throw new Error("Missing vehicle/registration number.");
        if (!name) throw new Error("Missing name.");
        if (!type) throw new Error("Missing type.");
        if (maxLoadCapacity === undefined || maxLoadCapacity <= 0) throw new Error("Invalid max load capacity.");
        if (acquisitionCost === undefined || acquisitionCost < 0) throw new Error("Invalid acquisition cost.");
        if (await getVehicleByRegistration(registrationNumber)) {
          throw new Error(`Registration number ${registrationNumber} already exists.`);
        }

        await createVehicle({
          registrationNumber,
          name,
          type,
          maxLoadCapacity,
          acquisitionCost,
          region,
          chassisNumber,
          insuranceExpiry,
          pucExpiry,
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
