"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useLanguage } from "@/lib/i18n/context";
import { useConfirm } from "@/lib/confirm-context";
import { useToast } from "@/lib/toast-context";

export function DriverActions({
  driverId,
  status,
  driverName,
}: {
  driverId: string;
  status: string;
  driverName?: string;
}) {
  const router = useRouter();
  const { t } = useLanguage();
  const confirm = useConfirm();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  async function setStatus(newStatus: string, requireConfirm: boolean) {
    if (requireConfirm) {
      const ok = await confirm({
        title: newStatus === "SUSPENDED" ? "Suspend this driver?" : "Reinstate this driver?",
        message:
          newStatus === "SUSPENDED"
            ? `${driverName ?? "This driver"} won't be selectable for new trips until reinstated.`
            : `${driverName ?? "This driver"} will become eligible for new trips again.`,
        confirmLabel: newStatus === "SUSPENDED" ? "Suspend" : "Reinstate",
        danger: newStatus === "SUSPENDED",
      });
      if (!ok) return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/drivers/${driverId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error ?? "Could not update driver.");
        return;
      }
      toast.success(newStatus === "SUSPENDED" ? "Driver suspended." : "Driver reinstated.");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  if (status === "ON_TRIP") {
    return <span className="text-xs text-slate-400">on trip</span>;
  }

  return status === "SUSPENDED" ? (
    <button
      disabled={loading}
      onClick={() => setStatus("AVAILABLE", false)}
      className="text-xs font-medium text-green-700 hover:underline dark:text-green-400"
    >
      {t("reinstate")}
    </button>
  ) : (
    <button
      disabled={loading}
      onClick={() => setStatus("SUSPENDED", true)}
      className="text-xs font-medium text-red-600 hover:underline dark:text-red-400"
    >
      {t("suspend")}
    </button>
  );
}
