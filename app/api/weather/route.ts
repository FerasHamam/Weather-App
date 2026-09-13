import { NextRequest, NextResponse } from "next/server";
import {
  getCachedWeather,
  normalizeCity,
  setCachedWeather,
} from "@/lib/weather/cache";
import { recordRecentSearch } from "@/lib/weather/recent-searches";
import { fetchWeather, WeatherProviderError } from "@/lib/weather/provider";
import { getOrCreateSessionId } from "@/lib/weather/session";

export const dynamic = "force-dynamic";

function errorResponse(
  status: number,
  code: string,
  message: string,
): NextResponse {
  return NextResponse.json({ error: { code, message } }, { status });
}

function withSession(response: NextResponse, sessionId: string): NextResponse {
  response.cookies.set("weather_session_id", sessionId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: "/",
  });
  return response;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const sessionId = getOrCreateSessionId(
    request.cookies.get("weather_session_id")?.value,
  );
  const city = normalizeCity(request.nextUrl.searchParams.get("city") ?? "");

  if (city.length < 2 || city.length > 100) {
    return withSession(
      errorResponse(
        400,
        "invalid-city",
        "Enter a city name between 2 and 100 characters.",
      ),
      sessionId,
    );
  }

  const cachedWeather = getCachedWeather(city);
  if (cachedWeather) {
    recordRecentSearch(sessionId, {
      city: cachedWeather.current.city,
      country: cachedWeather.current.country,
    });
    return withSession(NextResponse.json(cachedWeather), sessionId);
  }

  try {
    const weather = await fetchWeather(city);
    setCachedWeather(city, weather);
    recordRecentSearch(sessionId, {
      city: weather.current.city,
      country: weather.current.country,
    });
    return withSession(NextResponse.json(weather), sessionId);
  } catch (error) {
    if (error instanceof WeatherProviderError) {
      if (error.code === "invalid-city") {
        return withSession(
          errorResponse(404, error.code, error.message),
          sessionId,
        );
      }
      if (error.code === "rate-limit") {
        return withSession(
          errorResponse(429, error.code, error.message),
          sessionId,
        );
      }
      if (error.code === "configuration") {
        return withSession(
          errorResponse(500, error.code, error.message),
          sessionId,
        );
      }
      if (error.code === "network") {
        return withSession(
          errorResponse(503, error.code, error.message),
          sessionId,
        );
      }
      return withSession(
        errorResponse(502, error.code, error.message),
        sessionId,
      );
    }

    return withSession(
      errorResponse(
        500,
        "unknown",
        "Something went wrong while loading the weather.",
      ),
      sessionId,
    );
  }
}
