import type { NextRequest, NextResponse } from "next/server";
import type { RecentSearch } from "./model";
import { parseRecentSearches, serializeRecentSearches } from "./recent-searches";

export const RECENT_SEARCHES_COOKIE = "weather_recent_searches";

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

export function readRecentSearches(request: NextRequest): RecentSearch[] {
  return parseRecentSearches(request.cookies.get(RECENT_SEARCHES_COOKIE)?.value);
}

export function writeRecentSearches(
  response: NextResponse,
  searches: RecentSearch[],
): void {
  response.cookies.set(
    RECENT_SEARCHES_COOKIE,
    serializeRecentSearches(searches),
    {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: COOKIE_MAX_AGE_SECONDS,
      path: "/",
    },
  );
}
