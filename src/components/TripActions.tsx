"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useConfirm } from "@/lib/confirm-context";
import { useToast } from "@/lib/toast-context";

export function TripActions({
  tripId,
  status,
}: {
  tripId: string;
  status: string;
}) {
  const router = useRouter();
  const confirm = useConfirm();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [actualDistance, setActualDistance] = useState("");
  const [fuelConsumed, setFuelConsumed] = useState("");

  async function dispatch() {
    setLoading(true);
    try {
      const res = await fetch(`/api/trips/${tripId}/dispatch`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error);
        return;
      }
      toast.success("Trip dispatched.");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function cancel() {
    const ok = await confirm({
      title: "Cancel this trip?",
      message:
        status === "DISPATCHED"
          ? "The vehicle and driver will be restored to Available."
          : "This draft trip will be cancelled.",
      confirmLabel: "Cancel trip",
      danger: true,
    });
    if (!ok) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/trips/${tripId}/cancel`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error);
        return;
      }
      toast.success("Trip cancelled.");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function complete() {
    setLoading(true);
    try {
      const res = await fetch(`/api/trips/${tripId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actualDistance: Number(actualDistance),
          fuelConsumed: Number(fuelConsumed),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error);
        return;
      }
      toast.success("Trip completed.");
      setCompleting(false);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  if (status === "COMPLETED" || status === "CANCELLED") {
    return <span className="text-xs text-slate-400">—</span>;
  }

  if (status === "DRAFT") {
    return (
      <div className="flex gap-2">
        <button
          disabled={loading}
          onClick={dispatch}
          className="text-xs font-medium text-blue-700 hover:underline dark:text-blue-400"
        >
          Dispatch
        </button>
        <button
          disabled={loading}
          onClick={cancel}
          className="text-xs font-medium text-red-600 hover:underline dark:text-red-400"
        >
          Cancel
        </button>
      </div>
    );
  }

  // DISPATCHED
  if (!completing) {
    return (
      <div className="flex gap-2">
        <button
          disabled={loading}
          onClick={() => setCompleting(true)}
          className="text-xs font-medium text-green-700 hover:underline dark:text-green-400"
        >
          Complete
        </button>
        <button
          disabled={loading}
          onClick={cancel}
          className="text-xs font-medium text-red-600 hover:underline dark:text-red-400"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <input
        type="number"
        placeholder="Actual distance (km)"
        value={actualDistance}
        onChange={(e) => setActualDistance(e.target.value)}
        className="w-40 rounded border border-slate-300 px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
      />
      <input
        type="number"
        placeholder="Fuel consumed (L)"
        value={fuelConsumed}
        onChange={(e) => setFuelConsumed(e.target.value)}
        className="w-40 rounded border border-slate-300 px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
      />
      <div className="flex gap-2">
        <button
          disabled={loading}
          onClick={complete}
          className="text-xs font-medium text-green-700 hover:underline dark:text-green-400"
        >
          Confirm
        </button>
        <button
          disabled={loading}
          onClick={() => setCompleting(false)}
          className="text-xs font-medium text-slate-500 hover:underline dark:text-slate-400"
        >
          Back
        </button>
      </div>
    </div>
  );
}
