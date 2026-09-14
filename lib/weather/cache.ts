import type { Weather } from "./model";
import { toCityKey } from "./city-name";

export const WEATHER_CACHE_TTL_MS = 10 * 60 * 1000;

/**
 * Bounds the map so a long-lived server cannot accumulate one entry per unique
 * city ever searched.
 */
const MAX_CACHE_ENTRIES = 500;

export type CachedWeather = {
  weather: Weather;
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
  const key = toCityKey(city);
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
 * Stores a result under the city as the caller identifies it.
 */
export function setCachedWeather(
  city: string,
  value: CachedWeather,
  now = Date.now(),
): void {
  const key = toCityKey(city);
  if (!key) {
    return;
  }

  if (!cache.has(key) && cache.size >= MAX_CACHE_ENTRIES) {
    evict(now);
  }

  cache.set(key, { ...value, expiresAt: now + WEATHER_CACHE_TTL_MS });
}

export function clearWeatherCache(): void {
  cache.clear();
}
