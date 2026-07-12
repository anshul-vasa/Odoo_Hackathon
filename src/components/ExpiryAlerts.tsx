import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import type { ExpiringItem } from "@/lib/expiry";

export function ExpiryAlerts({ items, title }: { items: ExpiringItem[]; title?: string }) {
  if (items.length === 0) return null;

  return (
    <div className="mb-6 rounded-xl border border-amber-300 border-l-4 border-l-amber-500 bg-amber-50 p-4 shadow-sm dark:border-amber-800 dark:border-l-amber-500 dark:bg-amber-950/60">
      <div className="mb-2 flex items-center gap-2">
        <AlertTriangle size={18} className="shrink-0 text-amber-600 dark:text-amber-400" />
        <h2 className="text-sm font-bold uppercase tracking-wide text-amber-900 dark:text-amber-200">
          {title ?? "Expiring soon"} ({items.length})
        </h2>
      </div>
      <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
        {items.slice(0, 9).map((item, i) => (
          <li key={i}>
            <Link
              href={item.href}
              className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-1.5 text-xs hover:bg-white dark:bg-slate-900/40 dark:hover:bg-slate-900"
            >
              <span className="font-medium text-slate-800 dark:text-slate-200">
                {item.label} · {item.detail}
              </span>
              <span
                className={
                  item.daysLeft < 0
                    ? "font-semibold text-red-600 dark:text-red-400"
                    : "text-amber-700 dark:text-amber-400"
                }
              >
                {item.daysLeft < 0 ? "expired" : `${item.daysLeft}d left`}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
