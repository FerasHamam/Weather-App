import type { WeatherResponse } from "@/lib/weather/types";
import { WeatherIcon } from "@/components/weather-icon";

type ForecastCard = {
  key: string;
  day: string;
  dateLabel: string;
  high: string;
  low: string;
  iconCode?: string;
  description?: string;
  isToday?: boolean;
};

const sampleForecast: ForecastCard[] = [
  { key: "0", day: "Tomorrow", dateLabel: "--", high: "--", low: "--" },
  { key: "1", day: "Wednesday", dateLabel: "--", high: "--", low: "--" },
  { key: "2", day: "Thursday", dateLabel: "--", high: "--", low: "--" },
  { key: "3", day: "Friday", dateLabel: "--", high: "--", low: "--" },
  { key: "4", day: "Saturday", dateLabel: "--", high: "--", low: "--" },
];

type ForecastSectionProps = {
  weather: WeatherResponse | null;
};

export function ForecastSection({ weather }: ForecastSectionProps) {
  const todayLabel = new Date().toISOString().slice(0, 10);

  const forecast: ForecastCard[] = weather
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
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {forecast.map((forecastDay) => (
          <div
            className="group relative flex min-h-40 flex-col items-center gap-3 rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4 text-center transition duration-200 hover:-translate-y-1 hover:border-[var(--accent)]/40 hover:shadow-[0_16px_40px_-24px_var(--shadow-color)]"
            key={forecastDay.key}
          >
            {forecastDay.isToday && (
              <span className="absolute right-3 top-3 rounded-full bg-[var(--accent)]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--accent-dark)]">
                Today
              </span>
            )}
            <div>
              <p className="text-sm font-semibold text-[var(--foreground)]">
                {forecastDay.day}
              </p>
              <p className="text-xs text-[var(--ink-muted)]">
                {forecastDay.dateLabel}
              </p>
            </div>
            <div className="grid size-11 place-items-center rounded-full bg-[var(--sky)] text-[var(--accent-dark)]">
              {forecastDay.iconCode ? (
                <WeatherIcon
                  iconCode={forecastDay.iconCode}
                  size={24}
                  aria-label={forecastDay.description}
                />
              ) : (
                <span aria-hidden="true" className="text-lg opacity-30">
                  ·
                </span>
              )}
            </div>
            <div className="mt-auto flex items-baseline gap-2">
              <span className="text-xl font-semibold">{forecastDay.high}</span>
              <span className="text-sm font-normal text-[var(--ink-muted)]">
                {forecastDay.low}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
