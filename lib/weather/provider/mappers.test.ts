import { describe, expect, test } from "bun:test";
import type { CurrentPayload, ForecastEntry } from "./dto";
import { toCurrentWeather, toDailyForecasts } from "./mappers";

function entry(
  dtTxt: string,
  min: number,
  max: number,
  description = "clear sky",
  icon = "01d",
): ForecastEntry {
  return {
    dt_txt: dtTxt,
    main: { temp_min: min, temp_max: max },
    weather: [{ description, icon }],
  };
}

describe("toDailyForecasts", () => {
  test("collapses three-hourly buckets into one entry per day", () => {
    const forecasts = toDailyForecasts([
      entry("2026-09-14 00:00:00", 10, 12),
      entry("2026-09-14 12:00:00", 15, 20),
      entry("2026-09-15 09:00:00", 8, 14),
    ]);

    expect(forecasts).toHaveLength(2);
    expect(forecasts[0]).toMatchObject({
      date: "2026-09-14",
      minTemperatureCelsius: 10,
      maxTemperatureCelsius: 20,
    });
  });

  test("describes a day using the bucket closest to midday", () => {
    const forecasts = toDailyForecasts([
      entry("2026-09-14 00:00:00", 10, 12, "clear sky", "01n"),
      entry("2026-09-14 12:00:00", 15, 20, "light rain", "10d"),
      entry("2026-09-14 21:00:00", 11, 13, "snow", "13n"),
    ]);

    expect(forecasts[0]).toMatchObject({
      description: "light rain",
      iconCode: "10d",
    });
  });

  test("returns at most five days", () => {
    const entries = Array.from({ length: 8 }, (_, index) =>
      entry(`2026-09-${String(14 + index).padStart(2, "0")} 12:00:00`, 5, 10),
    );

    expect(toDailyForecasts(entries)).toHaveLength(5);
  });
});

describe("toCurrentWeather", () => {
  const payload: CurrentPayload = {
    name: "Alvalade",
    sys: { country: "PT" },
    main: { temp: 21.4, feels_like: 20.8, humidity: 60 },
    wind: { speed: 3.2 },
    weather: [{ description: "clear sky", icon: "01d" }],
  };

  test("keeps the provider locality as a neighborhood when it adds information", () => {
    const current = toCurrentWeather(payload, { name: "Lisbon" });

    expect(current).toMatchObject({ city: "Lisbon", neighborhood: "Alvalade" });
  });

  test("drops the locality when it just repeats the city", () => {
    const current = toCurrentWeather(
      { ...payload, name: "Lisbon" },
      { name: "Lisbon" },
    );

    expect(current.neighborhood).toBeUndefined();
  });

  test("falls back to the resolved country and a zero wind speed", () => {
    const current = toCurrentWeather(
      { ...payload, sys: undefined, wind: undefined },
      { name: "Lisbon", country: "PT" },
    );

    expect(current).toMatchObject({ country: "PT", windSpeedMetersPerSecond: 0 });
  });
});
