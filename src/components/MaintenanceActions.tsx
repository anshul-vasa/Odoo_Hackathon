"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/lib/toast-context";

export function MaintenanceActions({ recordId, status }: { recordId: string; status: string }) {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  async function close() {
    setLoading(true);
    try {
      const res = await fetch(`/api/maintenance/${recordId}/close`, { method: "POST" });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error ?? "Could not close maintenance record.");
        return;
      }
      toast.success("Maintenance closed — vehicle restored to Available.");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  if (status === "CLOSED") return <span className="text-xs text-slate-400">closed</span>;

  return (
    <button
      disabled={loading}
      onClick={close}
      className="text-xs font-medium text-green-700 hover:underline dark:text-green-400"
    >
      Close &amp; Restore Vehicle
    </button>
  );
}
