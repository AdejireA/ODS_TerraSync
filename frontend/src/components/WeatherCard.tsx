import { useEffect, useState } from "react";
import { CloudRain, Droplets, Thermometer } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { getWeather, type WeatherResponse } from "../lib/api";
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";
import { ErrorState, LoadingState, NotAvailableState } from "./ui/StatusStates";

type LoadState = "loading" | "ready" | "error";

interface WeatherCardProps {
  state: string;
  lga?: string;
  /** Dashboard summary shows only today; the dedicated Weather page shows the full forecast. */
  compact?: boolean;
}

export function WeatherCard({ state, lga, compact = false }: WeatherCardProps) {
  const { t } = useLanguage();
  const [data, setData] = useState<WeatherResponse | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("loading");

  function load() {
    setLoadState("loading");
    getWeather(state, lga)
      .then((result) => {
        setData(result);
        setLoadState("ready");
      })
      .catch(() => setLoadState("error"));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, lga]);

  if (loadState === "loading") return <LoadingState label={t("weatherUnavailableReason")} />;
  if (loadState === "error") {
    return (
      <div className="space-y-2">
        <ErrorState label={t("notAvailableWeather")} />
        <Button variant="outline" size="sm" onClick={load}>{t("voiceRetry")}</Button>
      </div>
    );
  }
  if (!data) return null;

  if (!data.available) {
    return (
      <NotAvailableState label={data.reason || t("weatherUnavailableReason")}>
        <p className="mt-2 text-xs text-muted-foreground">{data.location.note}</p>
        <Button variant="outline" size="sm" className="mt-2" onClick={load}>{t("voiceRetry")}</Button>
      </NotAvailableState>
    );
  }

  const daily = compact ? data.daily?.slice(0, 1) : data.daily;

  return (
    <div className="space-y-2">
      <Card className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">{data.location.name}</p>
          <span className="text-metadata">{data.provider}</span>
        </div>
        <p className="text-metadata">{data.location.note}</p>

        {data.current && (
          <div className="flex items-center gap-4 pt-1">
            <span className="inline-flex items-center gap-1 text-lg font-bold text-primary">
              <Thermometer className="h-4 w-4" aria-hidden="true" />
              {Math.round(data.current.temperature_c)}°C
            </span>
            <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
              <Droplets className="h-3.5 w-3.5" aria-hidden="true" />
              {t("weatherHumidity")} {Math.round(data.current.relative_humidity_pct)}%
            </span>
          </div>
        )}
        {data.fetched_at && (
          <p className="text-metadata">
            {new Date(data.fetched_at).toLocaleString()}
          </p>
        )}
      </Card>

      {daily && daily.length > 0 && (
        <div className="grid gap-2 sm:grid-cols-3">
          {daily.map((day, index) => (
            <Card key={day.date} className="space-y-1">
              <p className="text-sm font-medium">
                {index === 0 ? t("weatherToday") : new Date(day.date).toLocaleDateString(undefined, { weekday: "short" })}
              </p>
              <p className="text-sm text-muted-foreground">
                {Math.round(day.temperature_min_c)}° – {Math.round(day.temperature_max_c)}°C
              </p>
              <p className="inline-flex items-center gap-1 text-metadata">
                <CloudRain className="h-3.5 w-3.5" aria-hidden="true" />
                {t("weatherRainChance")} {day.precipitation_probability_pct}%
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
