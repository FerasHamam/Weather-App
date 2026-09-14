import { describe, expect, test } from "bun:test";
import type { DailyForecast } from "@/lib/weather/model";
import {
  parseCalendarDate,
  toCalendarDate,
  toForecastCards,
} from "./view-model";

const day: DailyForecast = {
  date: "2026-09-14",
  minTemperatureCelsius: 11.4,
  maxTemperatureCelsius: 19.6,
  description: "light rain",
  iconCode: "10d",
};

describe("forecast view model", () => {
  test("parses a calendar date in the user's own calendar, not UTC", () => {
    // `new Date("2026-09-14")` is UTC midnight, which is 13 September for
    // anyone west of UTC. The forecast must not shift a day.
    const parsed = parseCalendarDate("2026-09-14");

    expect(parsed.getFullYear()).toBe(2026);
    expect(parsed.getMonth()).toBe(8);
    expect(parsed.getDate()).toBe(14);
  });

  test("round-trips through toCalendarDate", () => {
    expect(toCalendarDate(parseCalendarDate("2026-09-14"))).toBe("2026-09-14");
  });

  test("rounds temperatures and flags today", () => {
    const [card] = toForecastCards([day], "2026-09-14");

    expect(card).toMatchObject({
      key: "2026-09-14",
      high: "20°",
      low: "11°",
      isToday: true,
      iconCode: "10d",
    });
  });

  test("does not flag other days as today", () => {
    expect(toForecastCards([day], "2026-09-15")[0]?.isToday).toBe(false);
  });
});
