import type { DailyForecast } from "@/lib/weather/model";
import { ForecastDayCard } from "./forecast-card";
import { ForecastCardSkeleton } from "./skeleton";
import {
  PLACEHOLDER_FORECAST,
  toCalendarDate,
  toForecastCards,
} from "./view-model";

type ForecastSectionProps = {
  forecast: DailyForecast[] | null;
  isLoading?: boolean;
};

export function ForecastSection({
  forecast,
  isLoading = false,
}: ForecastSectionProps) {
  const days = forecast
    ? toForecastCards(forecast, toCalendarDate(new Date()))
    : PLACEHOLDER_FORECAST;

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
          ? PLACEHOLDER_FORECAST.map((placeholder) => (
              <ForecastCardSkeleton key={placeholder.key} />
            ))
          : days.map((day) => <ForecastDayCard key={day.key} day={day} />)}
      </div>
    </section>
  );
}
