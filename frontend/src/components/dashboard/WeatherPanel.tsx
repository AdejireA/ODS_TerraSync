import { useEffect, useState } from "react";
import { CloudRain, CloudSun, Droplets, Thermometer } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";
import { getWeather, type WeatherResponse } from "../../lib/api";
import { Card } from "../ui/Card";
import { ErrorState, LoadingState, NotAvailableState } from "../ui/StatusStates";

// Real forecast from GET /weather (Open-Meteo, approximate location). Shows an honest
// unavailable state instead of placeholder numbers when the provider fails.
export function WeatherPanel({ state, lga }: { state: string; lga: string }) {
  const { t, language } = useLanguage();
  const [weather, setWeather] = useState<WeatherResponse | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    getWeather(state, lga)
      .then((data) => {
        if (cancelled) return;
        setWeather(data);
        setStatus("ready");
      })
      .catch(() => !cancelled && setStatus("error"));
    return () => {
      cancelled = true;
    };
  }, [state, lga]);

  if (status === "loading") return <LoadingState label={t("weatherLoading")} />;
  if (status === "error" || !weather) return <ErrorState label={t("weatherError")} />;
  if (!weather.available || !weather.current || !weather.daily) {
    return <NotAvailableState label={t("weatherUnavailable")} />;
  }

  const locale = language === "yo" ? "yo-NG" : "en-NG";
  const dayLabel = (iso: string) =>
    new Date(`${iso}T12:00:00`).toLocaleDateString(locale, { weekday: "short", day: "numeric" });

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs text-muted-foreground">
            {t("weatherNow")} · {lga}, {state}
          </p>
          <p className="flex items-center gap-2 text-3xl font-bold">
            <CloudSun className="h-7 w-7 text-primary" aria-hidden="true" />
            {Math.round(weather.current.temperature_c)}°C
          </p>
        </div>
        <div className="space-y-1 text-right text-sm">
          <p className="flex items-center justify-end gap-1">
            <Droplets className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            {t("weatherHumidity")}: {weather.current.relative_humidity_pct}%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {weather.daily.map((day) => (
          <div key={day.date} className="rounded-md bg-muted p-2 text-center text-sm">
            <p className="font-medium">{dayLabel(day.date)}</p>
            <p className="flex items-center justify-center gap-1 text-xs">
              <Thermometer className="h-3 w-3" aria-hidden="true" />
              {Math.round(day.temperature_min_c)}–{Math.round(day.temperature_max_c)}°
            </p>
            <p className="flex items-center justify-center gap-1 text-xs">
              <CloudRain className="h-3 w-3" aria-hidden="true" />
              {day.precipitation_probability_pct ?? "–"}%
            </p>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        {weather.location.note} · {weather.provider}
      </p>
    </Card>
  );
}
