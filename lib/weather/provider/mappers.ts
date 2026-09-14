import type { CurrentWeather, DailyForecast } from "@/lib/weather/model";
import { normalizeCity } from "@/lib/weather/city-name";
import type { CurrentPayload, ForecastEntry } from "./dto";

const MIDDAY_HOUR = 12;
const FORECAST_DAYS = 5;

/**
 * Collapses the provider's three-hourly buckets into one entry per calendar
 * day: min/max across every bucket, and the condition from whichever bucket
 * sits closest to midday, so a day is described by its daytime weather rather
 * than by whatever happened to come first.
 *
 * The first day is today and covers only the hours that remain, so its range
 * narrows as the day goes on. The "Today" badge in the UI makes that explicit.
 */
export function toDailyForecasts(entries: ForecastEntry[]): DailyForecast[] {
  const byDate = new Map<
    string,
    { forecast: DailyForecast; middayDistance: number }
  >();

  for (const entry of entries) {
    const date = entry.dt_txt.slice(0, 10);
    const middayDistance = Math.abs(
      Number(entry.dt_txt.slice(11, 13)) - MIDDAY_HOUR,
    );
    const existing = byDate.get(date);

    if (!existing) {
      byDate.set(date, {
        middayDistance,
        forecast: {
          date,
          minTemperatureCelsius: entry.main.temp_min,
          maxTemperatureCelsius: entry.main.temp_max,
          description: entry.weather[0].description,
          iconCode: entry.weather[0].icon,
        },
      });
      continue;
    }

    existing.forecast.minTemperatureCelsius = Math.min(
      existing.forecast.minTemperatureCelsius,
      entry.main.temp_min,
    );
    existing.forecast.maxTemperatureCelsius = Math.max(
      existing.forecast.maxTemperatureCelsius,
      entry.main.temp_max,
    );

    if (middayDistance < existing.middayDistance) {
      existing.forecast.description = entry.weather[0].description;
      existing.forecast.iconCode = entry.weather[0].icon;
      existing.middayDistance = middayDistance;
    }
  }

  return [...byDate.values()]
    .slice(0, FORECAST_DAYS)
    .map(({ forecast }) => forecast);
}

export function toCurrentWeather(
  payload: CurrentPayload,
  resolved: { name: string; country?: string },
): CurrentWeather {
  const locality = payload.name;
  const city = normalizeCity(resolved.name);

  return {
    city,
    // The provider's `name` is often a district or suburb. Show it only when it
    // actually adds information beyond the resolved city.
    neighborhood:
      locality && locality.toLowerCase() !== city.toLowerCase()
        ? locality
        : undefined,
    country: payload.sys?.country ?? resolved.country ?? "",
    temperatureCelsius: payload.main.temp,
    feelsLikeCelsius: payload.main.feels_like,
    humidityPercent: payload.main.humidity,
    windSpeedMetersPerSecond: payload.wind?.speed ?? 0,
    description: payload.weather[0].description,
    iconCode: payload.weather[0].icon,
  };
}
