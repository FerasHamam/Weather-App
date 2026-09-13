import type { WeatherResponse } from "./types";
import { normalizeCity } from "./helpers";

export const WEATHER_CACHE_TTL_MS = 10 * 60 * 1000;

type CacheEntry = {
  value: WeatherResponse;
  expiresAt: number;
};

const cache = new Map<string, CacheEntry>();

export function getCachedWeather(
  city: string,
  now = Date.now(),
): WeatherResponse | null {
  const key = normalizeCity(city).toLowerCase();
  const entry = cache.get(key);

  if (!entry) {
    return null;
  }

  if (entry.expiresAt <= now) {
    cache.delete(key);
    return null;
  }

  return { ...entry.value, cached: true };
}

export function setCachedWeather(
  city: string,
  value: WeatherResponse,
  now = Date.now(),
): void {
  cache.set(normalizeCity(city).toLowerCase(), {
    value: { ...value, cached: false },
    expiresAt: now + WEATHER_CACHE_TTL_MS,
  });
}

export function clearWeatherCache(): void {
  cache.clear();
}
