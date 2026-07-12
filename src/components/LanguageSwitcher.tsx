"use client";

import { useState, useRef, useEffect } from "react";
import { Languages } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import { LANGUAGES } from "@/lib/i18n/translations";

export function LanguageSwitcher() {
  const { lang, setLang, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const current = LANGUAGES.find((l) => l.code === lang);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
      >
        <Languages size={17} />
        <span className="flex-1 text-left">{t("language")}</span>
        <span className="text-xs text-slate-400">{current?.native}</span>
      </button>
      {open && (
        <div className="absolute bottom-full left-0 z-20 mb-1 w-full min-w-[180px] rounded-lg border border-slate-200 bg-white p-1 shadow-lg dark:border-slate-700 dark:bg-slate-800">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => {
                setLang(l.code);
                setOpen(false);
              }}
              className={`flex w-full items-center justify-between rounded-md px-3 py-1.5 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 ${
                l.code === lang ? "font-semibold text-brand-600 dark:text-brand-400" : "text-slate-700 dark:text-slate-200"
              }`}
            >
              <span>{l.label}</span>
              <span className="text-xs text-slate-400">{l.native}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
