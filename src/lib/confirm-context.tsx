"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle } from "lucide-react";

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
}

type ConfirmFn = (options: ConfirmOptions | string) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolver = useRef<(value: boolean) => void>();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const confirm: ConfirmFn = useCallback((opts) => {
    setOptions(typeof opts === "string" ? { message: opts } : opts);
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  function handle(result: boolean) {
    setOptions(null);
    resolver.current?.(result);
  }

  // Rendered via a portal straight onto <body> — this is deliberate, not
  // cosmetic: if any ancestor in the page tree ever picks up a CSS
  // transform/filter (common with hover/transition utilities), a `fixed`
  // element loses the viewport as its containing block and instead gets
  // pinned to that ancestor, which is exactly the "dialog renders clipped
  // and overlapping content instead of centered over everything" bug. A
  // portal sidesteps that class of bug entirely.
  const dialog = options && (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-sm overflow-y-auto rounded-xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-700 dark:bg-slate-900">
            <div className="mb-3 flex items-center gap-2.5">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full ${
                  options.danger
                    ? "bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400"
                    : "bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300"
                }`}
              >
                <AlertTriangle size={18} />
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                {options.title ?? "Are you sure?"}
              </h3>
            </div>
            <p className="mb-5 text-sm text-slate-600 dark:text-slate-300">{options.message}</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => handle(false)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={() => handle(true)}
                className={`rounded-lg px-4 py-2 text-sm font-semibold text-white ${
                  options.danger ? "bg-red-600 hover:bg-red-700" : "bg-brand-600 hover:bg-brand-700"
                }`}
              >
                {options.confirmLabel ?? "Confirm"}
              </button>
            </div>
      </div>
    </div>
  );

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {mounted && dialog && createPortal(dialog, document.body)}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used within ConfirmProvider");
  return ctx;
}
