"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useConfirm } from "@/lib/confirm-context";
import { useToast } from "@/lib/toast-context";

export function VehicleActions({
  vehicleId,
  status,
}: {
  vehicleId: string;
  status: string;
}) {
  const router = useRouter();
  const confirm = useConfirm();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  async function retire() {
    const ok = await confirm({
      title: "Retire this vehicle?",
      message: "It will be permanently removed from the dispatch pool. This can't be undone from here.",
      confirmLabel: "Retire",
      danger: true,
    });
    if (!ok) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/vehicles/${vehicleId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "RETIRED" }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error ?? "Could not retire vehicle.");
        return;
      }
      toast.success("Vehicle retired.");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  if (status === "RETIRED") {
    return <span className="text-xs text-slate-400">retired</span>;
  }

  return (
    <button
      disabled={loading || status === "ON_TRIP" || status === "IN_SHOP"}
      onClick={retire}
      title={
        status === "ON_TRIP" || status === "IN_SHOP"
          ? "Vehicle must be Available before it can be retired"
          : undefined
      }
      className="text-xs font-medium text-red-600 hover:underline disabled:cursor-not-allowed disabled:text-slate-300 disabled:no-underline dark:text-red-400"
    >
      Retire
    </button>
  );
}
