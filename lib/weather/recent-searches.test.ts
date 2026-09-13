import { describe, expect, test } from "bun:test";
import {
  clearRecentSearches,
  listRecentSearches,
  recordRecentSearch,
} from "./recent-searches";

describe("recent searches", () => {
  test("moves duplicates to the front and caps the list at five", () => {
    const sessionId = "test-session";
    clearRecentSearches(sessionId);
    ["Lisbon", "Berlin", "Paris", "Tokyo", "Lima", "Oslo"].forEach((city) =>
      recordRecentSearch(sessionId, { city }),
    );
    recordRecentSearch(sessionId, { city: " berlin " });

    expect(listRecentSearches(sessionId).map((search) => search.city)).toEqual([
      "Berlin",
      "Oslo",
      "Lima",
      "Tokyo",
      "Paris",
    ]);
  });

  test("capitalizes only the first letter of a saved city", () => {
    const sessionId = "formatting-session";
    clearRecentSearches(sessionId);
    recordRecentSearch(sessionId, { city: "  LISBON  " });

    expect(listRecentSearches(sessionId)[0]?.city).toBe("Lisbon");
  });
});
