import { describe, expect, test } from "bun:test";
import { cityKey, formatCityName, normalizeCity } from "./city-name";

describe("formatCityName", () => {
  test("title-cases every word of a name the user typed", () => {
    expect(formatCityName("san francisco")).toBe("San Francisco");
    expect(formatCityName("NEW YORK")).toBe("New York");
    expect(formatCityName("  LISBON  ")).toBe("Lisbon");
  });

  test("capitalizes across hyphens", () => {
    expect(formatCityName("winston-salem")).toBe("Winston-Salem");
  });

  test("capitalizes every word, including short particles", () => {
    expect(formatCityName("rio de janeiro")).toBe("Rio De Janeiro");
  });

  test("leaves names that already carry their own casing alone", () => {
    expect(formatCityName("São Paulo")).toBe("São Paulo");
    expect(formatCityName("L'Aquila")).toBe("L'Aquila");
    expect(formatCityName("New York")).toBe("New York");
  });
});

describe("normalizeCity", () => {
  test("trims and collapses whitespace", () => {
    expect(normalizeCity("  san   francisco ")).toBe("san francisco");
  });
});

describe("cityKey", () => {
  test("ignores case and spacing so aliases collide", () => {
    expect(cityKey("  San   Francisco ")).toBe(cityKey("san francisco"));
  });
});
