import { NextResponse } from "next/server";

const SESSION_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function getOrCreateSessionId(value: string | undefined): string {
  return value && SESSION_ID_PATTERN.test(value) ? value : crypto.randomUUID();
}

export function getSessionIdFromCookieHeader(cookieHeader: string): string {
  const sessionCookie = cookieHeader.match(
    /(?:^|;\s*)weather_session_id=([^;]+)/,
  )?.[1];
  return getOrCreateSessionId(sessionCookie);
}

export function attachSessionCookie(
  response: NextResponse,
  sessionId: string,
): NextResponse {
  response.cookies.set("weather_session_id", sessionId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });
  return response;
}
