"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";

export function LogoutButton() {
  const router = useRouter();
  const { t } = useLanguage();
  return (
    <button
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/login");
        router.refresh();
      }}
      className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
    >
      <LogOut size={15} />
      {t("logout")}
    </button>
  );
}
