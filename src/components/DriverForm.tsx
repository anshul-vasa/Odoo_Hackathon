"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n/context";
import { useToast } from "@/lib/toast-context";

export function DriverForm() {
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
      const res = await fetch("/api/drivers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          licenseNumber: form.get("licenseNumber"),
          licenseCategory: form.get("licenseCategory"),
          licenseExpiryDate: new Date(
            form.get("licenseExpiryDate") as string
          ).toISOString(),
          contactNumber: form.get("contactNumber"),
          safetyScore: form.get("safetyScore")
            ? Number(form.get("safetyScore"))
            : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Could not create driver.");
        return;
      }
      toast.success(`Driver ${data.driver.name} registered.`);
      (e.target as HTMLFormElement).reset();
      setOpen(false);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white";
  const labelClass = "mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400";

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
      >
        + {t("registerDriver")}
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-6 grid grid-cols-2 gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900 md:grid-cols-3"
    >
      <div>
        <label className={labelClass}>Full Name</label>
        <input name="name" required className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>{t("licenseNumber")}</label>
        <input name="licenseNumber" required className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>{t("licenseCategory")}</label>
        <input name="licenseCategory" required placeholder="LMV, HMV..." className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>{t("licenseExpiry")}</label>
        <input name="licenseExpiryDate" type="date" required className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>{t("contactNumber")}</label>
        <input name="contactNumber" required className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>{t("safetyScore")} (0-100)</label>
        <input name="safetyScore" type="number" min={0} max={100} className={inputClass} />
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
