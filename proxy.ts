import { NextRequest, NextResponse } from "next/server";
import {
  attachSessionCookie,
  getOrCreateSessionId,
} from "@/lib/weather/session";

export function proxy(request: NextRequest): NextResponse {
  const sessionId = getOrCreateSessionId(
    request.cookies.get("weather_session_id")?.value,
  );
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-weather-session-id", sessionId);

  return attachSessionCookie(
    NextResponse.next({ request: { headers: requestHeaders } }),
    sessionId,
  );
}

export const config = {
  matcher: ["/api/weather", "/api/recent-searches"],
};