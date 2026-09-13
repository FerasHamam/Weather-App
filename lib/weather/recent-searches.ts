import type { RecentSearch } from "./types";
import { formatCityName } from "./helpers";

const MAX_RECENT_SEARCHES = 5;
const recentSearchesBySession = new Map<string, RecentSearch[]>();

export function listRecentSearches(sessionId: string): RecentSearch[] {
  return (recentSearchesBySession.get(sessionId) ?? []).map((search) => ({
    ...search,
  }));
}

export function recordRecentSearch(
  sessionId: string,
  search: RecentSearch,
): void {
  const normalizedCity = formatCityName(search.city);
  const searches = recentSearchesBySession.get(sessionId) ?? [];
  const existingIndex = searches.findIndex(
    (item) => item.city.toLowerCase() === normalizedCity.toLowerCase(),
  );

  if (existingIndex >= 0) {
    searches.splice(existingIndex, 1);
  }

  searches.unshift({ ...search, city: normalizedCity });
  recentSearchesBySession.set(
    sessionId,
    searches.slice(0, MAX_RECENT_SEARCHES),
  );
}

export function clearRecentSearches(sessionId?: string): void {
  if (sessionId) {
    recentSearchesBySession.delete(sessionId);
    return;
  }

  recentSearchesBySession.clear();
}
