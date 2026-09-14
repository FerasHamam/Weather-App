import type { DailyForecast } from "@/lib/weather/model";

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

export const PLACEHOLDER_FORECAST: ForecastCardData[] = [
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
].map((day, index) => ({
  key: String(index),
  day,
  dateLabel: "--",
  high: "--",
  low: "--",
}));

/**
 * Parses a `YYYY-MM-DD` calendar date as local midnight.
 *
 * `new Date("2026-09-14")` is parsed as UTC midnight, which then formats as the
 * *previous* day for anyone west of UTC — a New York user would see Sunday's
 * label on Monday's forecast. Passing the parts separately keeps the date in
 * the user's own calendar.
 */
export function parseCalendarDate(date: string): Date {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day);
}

/** Local `YYYY-MM-DD`, matching how the provider labels its day buckets. */
export function toCalendarDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function toForecastCards(
  forecast: DailyForecast[],
  today: string,
): ForecastCardData[] {
  return forecast.map((day) => {
    const date = parseCalendarDate(day.date);

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
      isToday: day.date === today,
    };
  });
}
