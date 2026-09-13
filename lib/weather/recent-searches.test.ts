import { describe, expect, test } from "bun:test";
import {
  clearRecentSearches,
  listRecentSearches,
  recordRecentSearch,
} from "./recent-searches";

describe("recent searches", () => {
  test("moves duplicates to the front and caps the list at five", () => {
    clearRecentSearches();
    ["Lisbon", "Berlin", "Paris", "Tokyo", "Lima", "Oslo"].forEach((city) =>
      recordRecentSearch({ city }),
    );
    recordRecentSearch({ city: " berlin " });

    expect(listRecentSearches().map((search) => search.city)).toEqual([
      "berlin",
      "Oslo",
      "Lima",
      "Tokyo",
      "Paris",
    ]);
  });
});
