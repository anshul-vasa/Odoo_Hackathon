"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, AlertTriangle, PlusCircle } from "lucide-react";
import { useToast } from "@/lib/toast-context";
import { useConfirm } from "@/lib/confirm-context";
import type { Vehicle, Challan } from "@/lib/types";

function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null;
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / (24 * 3600 * 1000));
}

function ExpiryPill({ label, date }: { label: string; date: string | null }) {
  const days = daysUntil(date);
  let tone = "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300";
  if (days !== null) {
    if (days < 0) tone = "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300";
    else if (days <= 30) tone = "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300";
    else tone = "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300";
  }
  return (
    <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
        {date ? date.slice(0, 10) : "—"}
      </p>
      {days !== null && (
        <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${tone}`}>
          {days < 0 ? "Expired" : `${days}d left`}
        </span>
      )}
    </div>
  );
}

export function VehicleCompliance({
  vehicle,
  challans,
  canWrite,
}: {
  vehicle: Vehicle;
  challans: Challan[];
  canWrite: boolean;
}) {
  const router = useRouter();
  const toast = useToast();
  const confirm = useConfirm();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [challanNumber, setChallanNumber] = useState("");
  const [reason, setReason] = useState("");
  const [amount, setAmount] = useState("");

  const pending = challans.filter((c) => c.status === "PENDING");

  async function addChallan(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/vehicles/${vehicle.id}/challans`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challanNumber, reason, amount: Number(amount) }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Could not add challan.");
        return;
      }
      toast.success("Challan recorded.");
      setShowForm(false);
      setChallanNumber("");
      setReason("");
      setAmount("");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function payChallan(id: string) {
    const ok = await confirm({
      title: "Mark challan as paid?",
      message: "This records the challan as settled. This cannot be undone.",
      confirmLabel: "Mark paid",
    });
    if (!ok) return;
    const res = await fetch(`/api/challans/${id}/pay`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error ?? "Could not update challan.");
      return;
    }
    toast.success("Challan marked paid.");
    router.refresh();
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Chassis Number</p>
          <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
            {vehicle.chassis_number ?? "—"}
          </p>
        </div>
        <ExpiryPill label="Insurance Expiry" date={vehicle.insurance_expiry} />
        <ExpiryPill label="PUC Expiry" date={vehicle.puc_expiry} />
        <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">FASTag</p>
          <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
            {vehicle.fastag_id ?? "Not linked"}
          </p>
          {vehicle.fastag_id && (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Balance: ₹{(vehicle.fastag_balance ?? 0).toLocaleString("en-IN")}
            </p>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-card dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3 dark:border-slate-800">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
            {pending.length > 0 ? (
              <AlertTriangle size={15} className="text-amber-500" />
            ) : (
              <ShieldCheck size={15} className="text-green-500" />
            )}
            Traffic Challans {pending.length > 0 ? `(${pending.length} pending)` : ""}
          </h3>
          {canWrite && (
            <button
              onClick={() => setShowForm((s) => !s)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:underline dark:text-brand-400"
            >
              <PlusCircle size={13} /> Add Challan
            </button>
          )}
        </div>

        {showForm && (
          <form onSubmit={addChallan} className="grid grid-cols-1 gap-3 border-b border-slate-200 p-4 sm:grid-cols-3 dark:border-slate-800">
            <input
              required
              placeholder="Challan number"
              value={challanNumber}
              onChange={(e) => setChallanNumber(e.target.value)}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
            <input
              required
              placeholder="Reason (e.g. overspeeding)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
            <input
              required
              type="number"
              min="1"
              placeholder="Amount (₹)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
            <button
              type="submit"
              disabled={loading}
              className="sm:col-span-3 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Challan"}
            </button>
          </form>
        )}

        {challans.length === 0 ? (
          <p className="px-5 py-6 text-sm text-slate-400">No challans on record for this vehicle.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">
              <tr>
                <th className="px-5 py-2">Challan #</th>
                <th className="px-5 py-2">Reason</th>
                <th className="px-5 py-2">Amount</th>
                <th className="px-5 py-2">Status</th>
                {canWrite && <th className="px-5 py-2">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {challans.map((c) => (
                <tr key={c.id}>
                  <td className="px-5 py-2.5 font-medium text-slate-900 dark:text-white">{c.challan_number}</td>
                  <td className="px-5 py-2.5 text-slate-600 dark:text-slate-300">{c.reason}</td>
                  <td className="px-5 py-2.5 text-slate-600 dark:text-slate-300">₹{c.amount.toLocaleString("en-IN")}</td>
                  <td className="px-5 py-2.5">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        c.status === "PAID"
                          ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
                          : "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                  {canWrite && (
                    <td className="px-5 py-2.5">
                      {c.status === "PENDING" && (
                        <button onClick={() => payChallan(c.id)} className="text-xs font-medium text-brand-600 hover:underline dark:text-brand-400">
                          Mark Paid
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
