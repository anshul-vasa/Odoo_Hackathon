"use client";

import { useEffect, useState } from "react";
import { CloudSun, AlertTriangle, Navigation, Loader2 } from "lucide-react";
import type { CityWeather } from "@/lib/weather";

export function WeatherRouteAdvisory({ tripId, source, destination }: { tripId: string; source: string; destination: string }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [data, setData] = useState<{ source: CityWeather; destination: CityWeather } | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    fetch(`/api/trips/${tripId}/weather`)
      .then((res) => res.json())
      .then((json) => {
        if (cancelled) return;
        if (json.source && json.destination) setData(json);
        else setError(true);
      })
      .catch(() => !cancelled && setError(true))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [tripId]);

  function CityCard({ label, city, weather }: { label: string; city: string; weather: CityWeather }) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-card dark:border-slate-800 dark:bg-slate-900">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
        <p className="text-sm font-semibold text-slate-900 dark:text-white">{city}</p>
        {weather.found ? (
          <>
            <div className="mt-2 flex items-center gap-2">
              <CloudSun size={20} className="text-blue-500" />
              <span className="text-2xl font-bold text-slate-900 dark:text-white">
                {Math.round(weather.temperatureC ?? 0)}°C
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{weather.condition}</p>
            <p className="text-xs text-slate-400">Wind {Math.round(weather.windKph ?? 0)} km/h</p>
            <p className="mt-2 rounded-lg bg-slate-50 p-2 text-xs text-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
              {weather.advisory}
            </p>
          </>
        ) : (
          <p className="mt-2 text-xs text-slate-400">Weather data unavailable for this location right now.</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {loading && (
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Loader2 size={16} className="animate-spin" /> Fetching weather advisory...
        </div>
      )}

      {!loading && error && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
          <AlertTriangle size={16} /> Couldn&rsquo;t reach the weather service right now — check your connection and try
          reopening this tab.
        </div>
      )}

      {!loading && !error && data && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <CityCard label="Source" city={source} weather={data.source} />
            <CityCard label="Destination" city={destination} weather={data.destination} />
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-card dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-1 flex items-center gap-2">
              <Navigation size={15} className="text-brand-600 dark:text-brand-400" />
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Route Note</h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              This is a weather-based advisory, not live traffic routing — a genuine turn-by-turn "best route with
              diversions" feature needs a paid mapping API (Google Maps/Mapbox) with an API key, which is out of
              scope for a keyless build. Use the conditions above to judge whether to delay dispatch or brief the
              driver on caution.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
