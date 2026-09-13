import { NextRequest, NextResponse } from "next/server";
import {
  getCachedWeather,
  normalizeCity,
  setCachedWeather,
} from "@/lib/weather/cache";
import { recordRecentSearch } from "@/lib/weather/recent-searches";
import { fetchWeather, WeatherProviderError } from "@/lib/weather/provider";

export const dynamic = "force-dynamic";

function errorResponse(
  status: number,
  code: string,
  message: string,
): NextResponse {
  return NextResponse.json({ error: { code, message } }, { status });
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const city = normalizeCity(request.nextUrl.searchParams.get("city") ?? "");

  if (city.length < 2 || city.length > 100) {
    return errorResponse(
      400,
      "invalid-city",
      "Enter a city name between 2 and 100 characters.",
    );
  }

  const cachedWeather = getCachedWeather(city);
  if (cachedWeather) {
    return NextResponse.json(cachedWeather);
  }

  try {
    const weather = await fetchWeather(city);
    setCachedWeather(city, weather);
    recordRecentSearch({
      city: weather.current.city,
      country: weather.current.country,
    });
    return NextResponse.json(weather);
  } catch (error) {
    if (error instanceof WeatherProviderError) {
      if (error.code === "invalid-city") {
        return errorResponse(404, error.code, error.message);
      }
      if (error.code === "rate-limit") {
        return errorResponse(429, error.code, error.message);
      }
      if (error.code === "configuration") {
        return errorResponse(500, error.code, error.message);
      }
      if (error.code === "network") {
        return errorResponse(503, error.code, error.message);
      }
      return errorResponse(502, error.code, error.message);
    }

    return errorResponse(
      500,
      "unknown",
      "Something went wrong while loading the weather.",
    );
  }
}
