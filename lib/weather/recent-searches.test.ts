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
      "berlin",
      "Oslo",
      "Lima",
      "Tokyo",
      "Paris",
    ]);
  });
});
