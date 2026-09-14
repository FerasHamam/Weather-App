import { describe, expect, test } from "bun:test";
import { parseRecentSearches, withRecentSearch } from "./recent-searches";
import type { RecentSearch } from "./model";

describe("recent searches", () => {
  test("moves duplicates to the front and caps the list at five", () => {
    const searches = [
      "Lisbon",
      "Berlin",
      "Paris",
      "Tokyo",
      "Lima",
      "Oslo",
    ].reduce((list, city) => withRecentSearch(list, { city }), [] as RecentSearch[]);
    const withDuplicate = withRecentSearch(searches, { city: " berlin " });

    expect(withDuplicate.map((search) => search.city)).toEqual([
      "Berlin",
      "Oslo",
      "Lima",
      "Tokyo",
      "Paris",
    ]);
  });

  test("stores a typed city under its display casing", () => {
    expect(withRecentSearch([], { city: "  SAN FRANCISCO  " })[0]?.city).toBe(
      "San Francisco",
    );
  });

  test("round-trips through cookie serialization", () => {
    const searches = withRecentSearch([], { city: "Cairo", country: "EG" });

    expect(parseRecentSearches(JSON.stringify(searches))).toEqual(searches);
  });

  test("ignores missing or malformed cookie values", () => {
    expect(parseRecentSearches(undefined)).toEqual([]);
    expect(parseRecentSearches("not json")).toEqual([]);
    expect(parseRecentSearches('{"not":"an array"}')).toEqual([]);
  });
});
