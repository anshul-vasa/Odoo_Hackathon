export function KpiCard({
  label,
  value,
  icon: Icon,
  tint,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  tint: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card transition hover:shadow-card-hover dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${tint}`}>
          <Icon size={18} />
        </div>
      </div>
      <p className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
    </div>
  );
}
