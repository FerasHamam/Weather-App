import { NextResponse } from "next/server";
import { listRecentSearches } from "@/lib/weather/recent-searches";
import { getOrCreateSessionId } from "@/lib/weather/session";

export const dynamic = "force-dynamic";

export function GET(request: Request): NextResponse {
  const sessionId = getOrCreateSessionId(
    request.headers.get("x-weather-session-id") ?? undefined,
  );
  return NextResponse.json({
    searches: listRecentSearches(sessionId),
  });
}
