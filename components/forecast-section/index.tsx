import type { WeatherResponse } from "@/lib/weather/types";
import { ForecastDayCard, type ForecastCardData } from "./forecast-card";
import { ForecastCardSkeleton } from "./skeleton";

const sampleForecast: ForecastCardData[] = [
  { key: "0", day: "Mon", dateLabel: "--", high: "--", low: "--" },
  { key: "1", day: "Tue", dateLabel: "--", high: "--", low: "--" },
  { key: "2", day: "Wed", dateLabel: "--", high: "--", low: "--" },
  { key: "3", day: "Thu", dateLabel: "--", high: "--", low: "--" },
  { key: "4", day: "Fri", dateLabel: "--", high: "--", low: "--" },
];

type ForecastSectionProps = {
  weather: WeatherResponse | null;
  isLoading?: boolean;
};

export function ForecastSection({
  weather,
  isLoading = false,
}: ForecastSectionProps) {
  const todayLabel = new Date().toISOString().slice(0, 10);

  const forecast: ForecastCardData[] = weather
    ? weather.forecast.map((day) => {
        const date = new Date(day.date);
        return {
          key: day.date,
          day: date.toLocaleDateString(undefined, { weekday: "short" }),
          dateLabel: date.toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          }),
          high: `${Math.round(day.maxTemperatureCelsius)}°`,
          low: `${Math.round(day.minTemperatureCelsius)}°`,
          iconCode: day.iconCode,
          description: day.description,
          isToday: day.date === todayLabel,
        };
      })
    : sampleForecast;

  return (
    <section className="border-t border-[var(--line)] pt-7">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--accent-dark)]">
            The week ahead
          </p>
          <h2 className="mt-2 text-2xl font-semibold">Five-day forecast</h2>
        </div>
        <p className="hidden text-sm text-[var(--ink-muted)] sm:block">
          Daily outlook
        </p>
      </div>
      <div
        className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5"
        aria-busy={isLoading}
      >
        {isLoading
          ? Array.from({ length: 5 }).map((_, index) => (
              <ForecastCardSkeleton key={index} />
            ))
          : forecast.map((forecastDay) => (
              <ForecastDayCard key={forecastDay.key} day={forecastDay} />
            ))}
      </div>
    </section>
  );
}
