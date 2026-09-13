import type { RecentSearch } from "./types";

const MAX_RECENT_SEARCHES = 5;
const recentSearches: RecentSearch[] = [];

export function listRecentSearches(): RecentSearch[] {
  return recentSearches.map((search) => ({ ...search }));
}

export function recordRecentSearch(search: RecentSearch): void {
  const normalizedCity = search.city.trim().replace(/\s+/g, " ");
  const existingIndex = recentSearches.findIndex(
    (item) => item.city.toLowerCase() === normalizedCity.toLowerCase(),
  );

  if (existingIndex >= 0) {
    recentSearches.splice(existingIndex, 1);
  }

  recentSearches.unshift({ ...search, city: normalizedCity });
  recentSearches.splice(MAX_RECENT_SEARCHES);
}

export function clearRecentSearches(): void {
  recentSearches.length = 0;
}
