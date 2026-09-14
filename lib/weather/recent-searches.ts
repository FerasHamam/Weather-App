import type { RecentSearch } from "./model";
import { cityKey, formatCityName } from "./city-name";

export const MAX_RECENT_SEARCHES = 5;

function isRecentSearch(value: unknown): value is RecentSearch {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.city === "string" &&
    (candidate.country === undefined || typeof candidate.country === "string")
  );
}

export function parseRecentSearches(
  serialized: string | undefined,
): RecentSearch[] {
  if (!serialized) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(serialized);
    return Array.isArray(parsed)
      ? parsed.filter(isRecentSearch).slice(0, MAX_RECENT_SEARCHES)
      : [];
  } catch {
    return [];
  }
}

export function serializeRecentSearches(searches: RecentSearch[]): string {
  return JSON.stringify(searches);
}

/** Most recent first, case-insensitively de-duplicated, capped at five. */
export function withRecentSearch(
  searches: RecentSearch[],
  search: RecentSearch,
): RecentSearch[] {
  const city = formatCityName(search.city);
  const key = cityKey(city);
  const withoutDuplicate = searches.filter((item) => cityKey(item.city) !== key);

  return [{ ...search, city }, ...withoutDuplicate].slice(
    0,
    MAX_RECENT_SEARCHES,
  );
}
