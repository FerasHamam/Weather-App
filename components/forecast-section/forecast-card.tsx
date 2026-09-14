import { WeatherIcon } from "@/components/weather-icon";

export type ForecastCardData = {
  key: string;
  day: string;
  dateLabel: string;
  high: string;
  low: string;
  iconCode?: string;
  description?: string;
  isToday?: boolean;
};

type ForecastDayCardProps = {
  day: ForecastCardData;
};

export function ForecastDayCard({ day }: ForecastDayCardProps) {
  return (
    <div className="group relative flex h-40 min-h-0 flex-col items-center gap-3 overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4 text-center transition duration-200 hover:-translate-y-1 hover:border-[var(--accent)]/40 hover:shadow-[0_16px_40px_-24px_var(--shadow-color)]">
      {day.isToday && (
        <span className="absolute right-3 top-3 rounded-full bg-[var(--accent)]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--accent-dark)]">
          Today
        </span>
      )}
      <div className="w-full">
        <p className="truncate text-sm font-semibold text-[var(--foreground)]">
          {day.day}
        </p>
        <p className="truncate text-xs text-[var(--ink-muted)]">
          {day.dateLabel}
        </p>
      </div>
      <div className="grid size-11 shrink-0 place-items-center rounded-full bg-[var(--sky)] text-[var(--accent-dark)]">
        {day.iconCode ? (
          <WeatherIcon
            iconCode={day.iconCode}
            size={24}
            aria-label={day.description}
          />
        ) : (
          <span aria-hidden="true" className="text-lg opacity-30">
            ·
          </span>
        )}
      </div>
      <div className="mt-auto flex max-w-full items-baseline gap-2">
        <span className="truncate text-xl font-semibold">{day.high}</span>
        <span className="truncate text-sm font-normal text-[var(--ink-muted)]">
          {day.low}
        </span>
      </div>
    </div>
  );
}
