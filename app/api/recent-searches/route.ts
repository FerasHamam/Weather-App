import { NextResponse } from "next/server";
import { listRecentSearches } from "@/lib/weather/recent-searches";
import { getOrCreateSessionId } from "@/lib/weather/session";

export const dynamic = "force-dynamic";

export function GET(request: Request): NextResponse {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const sessionCookie = cookieHeader.match(
    /(?:^|;\s*)weather_session_id=([^;]+)/,
  )?.[1];
  const sessionId = getOrCreateSessionId(sessionCookie);
  const response = NextResponse.json({
    searches: listRecentSearches(sessionId),
  });
  response.cookies.set("weather_session_id", sessionId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });
  return response;
}
