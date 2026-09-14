import type { Weather } from "./model";
import { cityKey } from "./city-name";

export const WEATHER_CACHE_TTL_MS = 10 * 60 * 1000;

/**
 * Bounds the map so a long-lived server cannot accumulate one entry per unique
 * city ever searched.
 */
const MAX_CACHE_ENTRIES = 500;

export type CachedWeather = {
  weather: Weather;
  /** When the upstream call happened, not when it was cached. */
  fetchedAt: string;
};

type CacheEntry = CachedWeather & { expiresAt: number };

const cache = new Map<string, CacheEntry>();

function evict(now: number): void {
  for (const [key, entry] of cache) {
    if (entry.expiresAt <= now) {
      cache.delete(key);
    }
  }
  // Map iterates in insertion order, so this drops the oldest writes first.
  for (const key of cache.keys()) {
    if (cache.size < MAX_CACHE_ENTRIES) {
      break;
    }
    cache.delete(key);
  }
}

export function getCachedWeather(
  city: string,
  now = Date.now(),
): CachedWeather | null {
  const key = cityKey(city);
  const entry = cache.get(key);

  if (!entry) {
    return null;
  }

  if (entry.expiresAt <= now) {
    cache.delete(key);
    return null;
  }

  return { weather: entry.weather, fetchedAt: entry.fetchedAt };
}

/**
 * Stores one result under several keys.
 *
 * A search for "NYC" resolves to "New York", and both must hit this entry —
 * otherwise every alias pays for a fresh set of upstream calls forever.
 */
export function setCachedWeather(
  cities: string[],
  value: CachedWeather,
  now = Date.now(),
): void {
  if (cache.size >= MAX_CACHE_ENTRIES) {
    evict(now);
  }

  const entry: CacheEntry = { ...value, expiresAt: now + WEATHER_CACHE_TTL_MS };
  for (const city of cities) {
    const key = cityKey(city);
    if (key) {
      cache.set(key, entry);
    }
  }
}

export function clearWeatherCache(): void {
  cache.clear();
}
