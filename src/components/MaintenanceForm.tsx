"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/lib/toast-context";
import type { Vehicle } from "@/lib/types";

export function MaintenanceForm({ vehicles }: { vehicles: Vehicle[] }) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const inputClass =
    "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white";
  const labelClass = "mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleId: form.get("vehicleId"),
          description: form.get("description"),
          cost: form.get("cost") ? Number(form.get("cost")) : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Could not create maintenance record.");
        return;
      }
      toast.success("Maintenance request raised — vehicle moved to In Shop.");
      (e.target as HTMLFormElement).reset();
      setOpen(false);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
      >
        + Raise Maintenance Request
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-6 grid grid-cols-2 gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900 md:grid-cols-3"
    >
      <div>
        <label className={labelClass}>Vehicle</label>
        <select name="vehicleId" required defaultValue="" className={inputClass}>
          <option value="" disabled>
            Select a vehicle
          </option>
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>
              {v.registration_number} — {v.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className={labelClass}>Description</label>
        <input name="description" required placeholder="Oil change, brake pads..." className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>Estimated Cost (₹)</label>
        <input name="cost" type="number" step="any" min={0} className={inputClass} />
      </div>
      {vehicles.length === 0 && (
        <p className="col-span-full text-xs text-amber-600 dark:text-amber-400">
          No vehicles are eligible right now — a vehicle must not be On Trip or
          Retired to enter maintenance.
        </p>
      )}
      <div className="col-span-full flex gap-2 pt-1">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
