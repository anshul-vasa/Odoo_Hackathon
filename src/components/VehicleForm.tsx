"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CityAutocomplete } from "@/components/CityAutocomplete";
import { useLanguage } from "@/lib/i18n/context";
import { useToast } from "@/lib/toast-context";

export function VehicleForm() {
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
      const res = await fetch("/api/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registrationNumber: (form.get("registrationNumber") as string)?.toUpperCase(),
          name: form.get("name"),
          type: form.get("type"),
          maxLoadCapacity: Number(form.get("maxLoadCapacity")),
          acquisitionCost: Number(form.get("acquisitionCost")),
          region: form.get("region") || undefined,
          chassisNumber: form.get("chassisNumber") || undefined,
          insuranceExpiry: form.get("insuranceExpiry")
            ? new Date(form.get("insuranceExpiry") as string).toISOString()
            : undefined,
          pucExpiry: form.get("pucExpiry")
            ? new Date(form.get("pucExpiry") as string).toISOString()
            : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Could not create vehicle.");
        return;
      }
      toast.success(`Vehicle ${data.vehicle.registration_number} registered.`);
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
        + {t("registerVehicle")}
      </button>
    );
  }

  const inputClass =
    "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white";
  const labelClass = "mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400";

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-6 grid grid-cols-2 gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900 md:grid-cols-3"
    >
      <div>
        <label className={labelClass}>{t("registrationNumber")} (e.g. GJ01AB1234)</label>
        <input name="registrationNumber" required placeholder="GJ01AB1234" className={`${inputClass} uppercase`} />
      </div>
      <div>
        <label className={labelClass}>{t("vehicleName")}</label>
        <input name="name" required placeholder="Tata Ace" className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>{t("type")}</label>
        <input name="type" required placeholder="Van, Truck..." className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>{t("maxLoadCapacity")} (kg)</label>
        <input name="maxLoadCapacity" type="number" step="any" required className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>{t("acquisitionCost")} (₹)</label>
        <input name="acquisitionCost" type="number" step="any" required className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>{t("region")}</label>
        <CityAutocomplete name="region" placeholder="Start typing a city..." />
      </div>
      <div>
        <label className={labelClass}>{t("chassisNumber")}</label>
        <input name="chassisNumber" placeholder="Optional" className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>{t("insuranceExpiry")}</label>
        <input name="insuranceExpiry" type="date" className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>{t("pucExpiry")}</label>
        <input name="pucExpiry" type="date" className={inputClass} />
      </div>
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
