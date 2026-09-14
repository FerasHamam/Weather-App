import type { NextRequest, NextResponse } from "next/server";
import type { RecentSearch } from "./types";
import { formatCityName } from "./helpers";

const COOKIE_NAME = "weather_recent_searches";
const MAX_RECENT_SEARCHES = 5;
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

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
  cookieValue: string | undefined,
): RecentSearch[] {
  if (!cookieValue) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(cookieValue);
    return Array.isArray(parsed)
      ? parsed.filter(isRecentSearch).slice(0, MAX_RECENT_SEARCHES)
      : [];
  } catch {
    return [];
  }
}

export function withRecentSearch(
  searches: RecentSearch[],
  search: RecentSearch,
): RecentSearch[] {
  const normalizedCity = formatCityName(search.city);
  const withoutDuplicate = searches.filter(
    (item) => item.city.toLowerCase() !== normalizedCity.toLowerCase(),
  );

  return [{ ...search, city: normalizedCity }, ...withoutDuplicate].slice(
    0,
    MAX_RECENT_SEARCHES,
  );
}

export function readRecentSearches(request: NextRequest): RecentSearch[] {
  return parseRecentSearches(request.cookies.get(COOKIE_NAME)?.value);
}

export function recordRecentSearch(
  request: NextRequest,
  response: NextResponse,
  search: RecentSearch,
): void {
  const updated = withRecentSearch(readRecentSearches(request), search);
  response.cookies.set(COOKIE_NAME, JSON.stringify(updated), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: COOKIE_MAX_AGE_SECONDS,
    path: "/",
  });
}
