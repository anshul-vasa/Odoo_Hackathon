export type Role =
  | "FLEET_MANAGER"
  | "DRIVER"
  | "SAFETY_OFFICER"
  | "FINANCIAL_ANALYST";

export const ROLES: Role[] = [
  "FLEET_MANAGER",
  "DRIVER",
  "SAFETY_OFFICER",
  "FINANCIAL_ANALYST",
];

export type VehicleStatus = "AVAILABLE" | "ON_TRIP" | "IN_SHOP" | "RETIRED";

export type DriverStatus = "AVAILABLE" | "ON_TRIP" | "OFF_DUTY" | "SUSPENDED";

export type TripStatus = "DRAFT" | "DISPATCHED" | "COMPLETED" | "CANCELLED";

export type MaintenanceStatus = "OPEN" | "CLOSED";

export interface User {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: Role;
  created_at: string;
}

export interface Vehicle {
  id: string;
  registration_number: string;
  name: string;
  type: string;
  max_load_capacity: number;
  odometer: number;
  acquisition_cost: number;
  region: string | null;
  chassis_number: string | null;
  insurance_expiry: string | null;
  puc_expiry: string | null;
  fastag_id: string | null;
  fastag_balance: number | null;
  status: VehicleStatus;
  created_at: string;
  updated_at: string;
}

export interface Driver {
  id: string;
  name: string;
  license_number: string;
  license_category: string;
  license_expiry_date: string;
  contact_number: string;
  safety_score: number;
  status: DriverStatus;
  user_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Trip {
  id: string;
  source: string;
  destination: string;
  cargo_weight: number;
  planned_distance: number;
  actual_distance: number | null;
  fuel_consumed: number | null;
  status: TripStatus;
  vehicle_id: string;
  driver_id: string;
  created_at: string;
  dispatched_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
}

export interface MaintenanceRecord {
  id: string;
  vehicle_id: string;
  description: string;
  cost: number;
  status: MaintenanceStatus;
  created_at: string;
  closed_at: string | null;
}

export interface FuelLog {
  id: string;
  vehicle_id: string;
  liters: number;
  cost: number;
  date: string;
}

export interface Expense {
  id: string;
  vehicle_id: string;
  type: string;
  amount: number;
  date: string;
  description: string | null;
}

export type ChallanStatus = "PENDING" | "PAID";

export interface Challan {
  id: string;
  vehicle_id: string;
  challan_number: string;
  reason: string;
  amount: number;
  status: ChallanStatus;
  issued_date: string;
  paid_date: string | null;
  created_at: string;
}

export type TaxType = "CGST_SGST" | "IGST";

export interface Invoice {
  id: string;
  trip_id: string;
  invoice_number: string;
  taxable_amount: number;
  gst_rate: number;
  tax_type: TaxType;
  cgst_amount: number;
  sgst_amount: number;
  igst_amount: number;
  total_amount: number;
  eway_bill_number: string;
  eway_bill_valid_until: string;
  eway_bill_required: number;
  created_at: string;
}
