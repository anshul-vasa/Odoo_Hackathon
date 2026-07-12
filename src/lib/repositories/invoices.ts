import { db, toRow } from "@/lib/db";
import { newId } from "@/lib/id";
import { NotFoundError, ConflictError, ValidationError } from "@/lib/errors";
import { getTripById } from "@/lib/repositories/trips";
import type { Invoice, TaxType } from "@/lib/types";

const EWAY_BILL_THRESHOLD = 50000; // Rs. — the real-world e-way bill trigger for goods movement.

function generateInvoiceNumber(): string {
  const year = new Date().getFullYear();
  const seq = Math.floor(100000 + Math.random() * 900000);
  return `INV-${year}-${seq}`;
}

function generateEwayBillNumber(): string {
  // Real e-way bills are 12-digit numeric identifiers (EWB-01 format).
  let digits = "";
  for (let i = 0; i < 12; i++) digits += Math.floor(Math.random() * 10);
  return digits;
}

function ewayValidityDays(distanceKm: number): number {
  // Simplified version of the real rule: 1 day of validity per 200km, minimum 1 day.
  return Math.max(1, Math.ceil(distanceKm / 200));
}

export function getInvoiceByTripId(tripId: string): Invoice | undefined {
  return toRow<Invoice>(db.prepare("SELECT * FROM invoices WHERE trip_id = ?").get(tripId));
}

export function getInvoiceById(id: string): Invoice | undefined {
  return toRow<Invoice>(db.prepare("SELECT * FROM invoices WHERE id = ?").get(id));
}

export function createInvoice(input: {
  tripId: string;
  taxableAmount: number;
  gstRate: number;
  taxType: TaxType;
}): Invoice {
  const trip = getTripById(input.tripId);
  if (!trip) throw new NotFoundError("Trip not found.");
  if (getInvoiceByTripId(input.tripId)) {
    throw new ConflictError("An invoice already exists for this trip.");
  }
  if (input.taxableAmount <= 0) {
    throw new ValidationError("Taxable amount must be greater than zero.");
  }
  if (![0, 5, 12, 18, 28].includes(input.gstRate)) {
    throw new ValidationError("GST rate must be one of the standard slabs: 0, 5, 12, 18, 28%.");
  }

  const taxAmount = (input.taxableAmount * input.gstRate) / 100;
  const cgstAmount = input.taxType === "CGST_SGST" ? taxAmount / 2 : 0;
  const sgstAmount = input.taxType === "CGST_SGST" ? taxAmount / 2 : 0;
  const igstAmount = input.taxType === "IGST" ? taxAmount : 0;
  const totalAmount = input.taxableAmount + taxAmount;

  const distance = trip.actual_distance ?? trip.planned_distance;
  const ewayRequired = input.taxableAmount > EWAY_BILL_THRESHOLD;
  const validUntil = new Date();
  validUntil.setDate(validUntil.getDate() + ewayValidityDays(distance));

  const id = newId("inv");
  db.prepare(
    `INSERT INTO invoices
      (id, trip_id, invoice_number, taxable_amount, gst_rate, tax_type, cgst_amount, sgst_amount, igst_amount, total_amount, eway_bill_number, eway_bill_valid_until, eway_bill_required)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    input.tripId,
    generateInvoiceNumber(),
    input.taxableAmount,
    input.gstRate,
    input.taxType,
    cgstAmount,
    sgstAmount,
    igstAmount,
    totalAmount,
    generateEwayBillNumber(),
    validUntil.toISOString(),
    ewayRequired ? 1 : 0
  );
  return getInvoiceById(id)!;
}
