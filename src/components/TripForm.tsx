"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CityAutocomplete } from "@/components/CityAutocomplete";
import { useLanguage } from "@/lib/i18n/context";
import { useToast } from "@/lib/toast-context";
import type { Driver, Vehicle } from "@/lib/types";

export function TripForm({
  vehicles,
  drivers,
}: {
  vehicles: Vehicle[];
  drivers: Driver[];
}) {
  const router = useRouter();
  const { t } = useLanguage();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: form.get("source"),
          destination: form.get("destination"),
          vehicleId: form.get("vehicleId"),
          driverId: form.get("driverId"),
          cargoWeight: Number(form.get("cargoWeight")),
          plannedDistance: Number(form.get("plannedDistance")),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Could not create trip.");
        return;
      }
      toast.success("Trip created as Draft.");
      (e.target as HTMLFormElement).reset();
      setOpen(false);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  const labelClass = "mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400";
  const inputClass =
    "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white";

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
      >
        + {t("createTrip")}
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-6 grid grid-cols-2 gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900 md:grid-cols-3"
    >
      <div>
        <label className={labelClass}>{t("source")}</label>
        <CityAutocomplete name="source" required placeholder="e.g. Ahmedabad" />
      </div>
      <div>
        <label className={labelClass}>{t("destination")}</label>
        <CityAutocomplete name="destination" required placeholder="e.g. Surat" />
      </div>
      <div>
        <label className={labelClass}>{t("cargoWeight")} (kg)</label>
        <input name="cargoWeight" type="number" step="any" required className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>{t("plannedDistance")} (km)</label>
        <input name="plannedDistance" type="number" step="any" required className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>{t("vehicle")}</label>
        <select name="vehicleId" required defaultValue="" className={inputClass}>
          <option value="" disabled>
            Select available vehicle
          </option>
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>
              {v.registration_number} — {v.name} (max {v.max_load_capacity}kg)
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className={labelClass}>{t("driver")}</label>
        <select name="driverId" required defaultValue="" className={inputClass}>
          <option value="" disabled>
            Select available driver
          </option>
          {drivers.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name} ({d.license_category})
            </option>
          ))}
        </select>
      </div>
      {vehicles.length === 0 && (
        <p className="col-span-full text-xs text-amber-600 dark:text-amber-400">
          No vehicles are currently Available — free one up before creating a trip.
        </p>
      )}
      {drivers.length === 0 && (
        <p className="col-span-full text-xs text-amber-600 dark:text-amber-400">
          No eligible drivers Available (must not be Suspended and license must not
          be expired).
        </p>
      )}
      <div className="col-span-full flex gap-2 pt-1">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {loading ? t("saving") : t("save")}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          {t("cancel")}
        </button>
      </div>
    </form>
  );
}
