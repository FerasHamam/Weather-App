import { describe, expect, test } from "bun:test";
import {
  clearWeatherCache,
  getCachedWeather,
  setCachedWeather,
  WEATHER_CACHE_TTL_MS,
} from "./cache";
import type { Weather } from "./model";

const weather: Weather = {
  current: {
    city: "Lisbon",
    country: "PT",
    temperatureCelsius: 21,
    feelsLikeCelsius: 21,
    humidityPercent: 60,
    windSpeedMetersPerSecond: 3,
    description: "clear sky",
    iconCode: "01d",
  },
  forecast: [],
};

const cached = { weather, fetchedAt: "2026-09-13T10:00:00.000Z" };

describe("weather cache", () => {
  test("matches normalized city names", () => {
    clearWeatherCache();
    setCachedWeather(" Lisbon ", cached, 1000);

    expect(getCachedWeather("lisbon", 1001)).toEqual(cached);
  });

  test("does not serve a hit under an unrelated key", () => {
    clearWeatherCache();
    setCachedWeather("NYC", cached, 1000);

    expect(getCachedWeather("new york", 1001)).toBeNull();
  });

  test("expires entries after ten minutes", () => {
    clearWeatherCache();
    setCachedWeather("Lisbon", cached, 1000);

    expect(getCachedWeather("Lisbon", 1000 + WEATHER_CACHE_TTL_MS)).toBeNull();
  });

  test("preserves the upstream fetch time across a hit", () => {
    clearWeatherCache();
    setCachedWeather("Lisbon", cached, 1000);

    expect(getCachedWeather("Lisbon", 1001)?.fetchedAt).toBe(cached.fetchedAt);
  });
});
