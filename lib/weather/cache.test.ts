import { describe, expect, test } from "bun:test";
import {
  clearWeatherCache,
  getCachedWeather,
  setCachedWeather,
  WEATHER_CACHE_TTL_MS,
} from "./cache";
import type { WeatherResponse } from "./types";

const weather: WeatherResponse = {
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
  cached: false,
  fetchedAt: "2026-09-13T10:00:00.000Z",
};

describe("weather cache", () => {
  test("matches normalized city names and marks a hit as cached", () => {
    clearWeatherCache();
    setCachedWeather(" Lisbon ", weather, 1000);

    expect(getCachedWeather("lisbon", 1001)).toMatchObject({
      current: { city: "Lisbon" },
      cached: true,
    });
  });

  test("expires entries after ten minutes", () => {
    clearWeatherCache();
    setCachedWeather("Lisbon", weather, 1000);

    expect(getCachedWeather("Lisbon", 1000 + WEATHER_CACHE_TTL_MS)).toBeNull();
  });
});
