/**
 * OpenWeatherMap wire shapes and their runtime guards.
 *
 * Nothing outside `lib/weather/provider` should import from this file: these
 * are the provider's types, not the application's. `mappers.ts` converts them
 * into `lib/weather/model` types at the boundary.
 */

export type Coordinates = {
  lat: number;
  lon: number;
  name: string;
  country?: string;
};

export type CurrentPayload = {
  name: string;
  sys?: { country?: string };
  main: { temp: number; feels_like: number; humidity: number };
  wind?: { speed?: number };
  weather: Array<{ description: string; icon: string }>;
};

export type ForecastEntry = {
  dt_txt: string;
  main: { temp_min: number; temp_max: number };
  weather: Array<{ description: string; icon: string }>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function hasCondition(
  value: Record<string, unknown>,
): value is Record<string, unknown> & {
  weather: Array<{ description: string; icon: string }>;
} {
  return (
    Array.isArray(value.weather) &&
    value.weather.length > 0 &&
    isRecord(value.weather[0]) &&
    typeof value.weather[0].description === "string" &&
    typeof value.weather[0].icon === "string"
  );
}

export function isCoordinates(value: unknown): value is Coordinates {
  return (
    isRecord(value) &&
    typeof value.lat === "number" &&
    typeof value.lon === "number" &&
    typeof value.name === "string"
  );
}

export function isCurrentPayload(value: unknown): value is CurrentPayload {
  return (
    isRecord(value) &&
    typeof value.name === "string" &&
    isRecord(value.main) &&
    typeof value.main.temp === "number" &&
    typeof value.main.feels_like === "number" &&
    typeof value.main.humidity === "number" &&
    hasCondition(value)
  );
}

export function isForecastEntry(value: unknown): value is ForecastEntry {
  return (
    isRecord(value) &&
    typeof value.dt_txt === "string" &&
    isRecord(value.main) &&
    typeof value.main.temp_min === "number" &&
    typeof value.main.temp_max === "number" &&
    hasCondition(value)
  );
}

/**
 * Returns the usable entries from a forecast payload, or `null` if the payload
 * is not a forecast at all. Individual malformed entries are dropped rather
 * than failing the whole request, since one bad bucket out of forty should not
 * cost the user their forecast.
 */
export function readForecastEntries(value: unknown): ForecastEntry[] | null {
  if (!isRecord(value) || !Array.isArray(value.list)) {
    return null;
  }
  const entries = value.list.filter(isForecastEntry);
  return entries.length > 0 ? entries : null;
}
