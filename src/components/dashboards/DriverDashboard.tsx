"use client";

import Link from "next/link";
import { Route, Clock, CheckCircle2, PlusCircle, MapPin, Package } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { useLanguage } from "@/lib/i18n/context";
import type { Trip } from "@/lib/types";

// Driver gets a single-column, card-list layout instead of a data table —
// closer to a mobile task list than an admin screen, since this is the one
// role that's actually checking the dashboard in between drives rather than
// analyzing the fleet.
export function DriverDashboard({ trips }: { trips: Trip[] }) {
  const { t } = useLanguage();
  const dispatched = trips.filter((t) => t.status === "DISPATCHED");
  const draft = trips.filter((t) => t.status === "DRAFT");
  const completedToday = trips.filter(
    (t) => t.status === "COMPLETED" && t.completed_at?.slice(0, 10) === new Date().toISOString().slice(0, 10)
  );

  const active = [...dispatched, ...draft].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Link
        href="/trips"
        className="flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 py-4 text-base font-semibold text-white shadow-card transition hover:bg-brand-700"
      >
        <PlusCircle size={20} />
        {t("createATrip")}
      </Link>

      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-card dark:border-slate-800 dark:bg-slate-900">
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{dispatched.length}</p>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{t("onTheRoad")}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-card dark:border-slate-800 dark:bg-slate-900">
          <p className="text-2xl font-bold text-slate-600 dark:text-slate-300">{draft.length}</p>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{t("waitingToDispatch")}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-card dark:border-slate-800 dark:bg-slate-900">
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{completedToday.length}</p>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{t("finishedToday")}</p>
        </div>
      </div>

      <div>
        <h2 className="mb-2 px-1 text-sm font-semibold text-slate-700 dark:text-slate-200">
          {t("activeAndPending")}
        </h2>
        {active.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white py-10 text-center dark:border-slate-700 dark:bg-slate-900">
            <Clock size={22} className="text-slate-300 dark:text-slate-600" />
            <p className="text-sm text-slate-400">{t("nothingOnPlate")}</p>
          </div>
        ) : (
          <ul className="space-y-2.5">
            {active.map((t) => (
              <li
                key={t.id}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-card dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                    <MapPin size={15} className="shrink-0 text-brand-500" />
                    {t.source} → {t.destination}
                  </div>
                  <StatusBadge status={t.status} />
                </div>
                <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <Package size={13} /> {t.cargo_weight} kg cargo · {t.planned_distance} km planned
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Link
        href="/trips"
        className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
      >
        <Route size={15} /> {t("viewAllTrips")}
      </Link>
    </div>
  );
}
