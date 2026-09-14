import { describe, expect, test } from "bun:test";
import { isCoordinates, isCurrentPayload, readForecastEntries } from "./dto";

describe("provider payload guards", () => {
  test("accepts a well-formed geocode result", () => {
    expect(isCoordinates({ lat: 38.7, lon: -9.1, name: "Lisbon" })).toBe(true);
  });

  test("rejects a geocode result missing coordinates", () => {
    expect(isCoordinates({ name: "Lisbon" })).toBe(false);
    expect(isCoordinates(null)).toBe(false);
  });

  test("rejects a current payload with no weather condition", () => {
    expect(
      isCurrentPayload({
        name: "Lisbon",
        main: { temp: 1, feels_like: 1, humidity: 1 },
        weather: [],
      }),
    ).toBe(false);
  });

  test("drops malformed forecast entries instead of failing the request", () => {
    const entries = readForecastEntries({
      list: [
        {
          dt_txt: "2026-09-14 12:00:00",
          main: { temp_min: 10, temp_max: 20 },
          weather: [{ description: "clear sky", icon: "01d" }],
        },
        { dt_txt: "2026-09-14 15:00:00" },
      ],
    });

    expect(entries).toHaveLength(1);
  });

  test("returns null when the payload is not a forecast", () => {
    expect(readForecastEntries({ list: [] })).toBeNull();
    expect(readForecastEntries({})).toBeNull();
  });
});
