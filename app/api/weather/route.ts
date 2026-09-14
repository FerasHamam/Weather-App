import { NextRequest, NextResponse } from "next/server";
import {
  getCachedWeather,
  setCachedWeather,
} from "@/lib/weather/cache";
import { formatCityName, normalizeCity } from "@/lib/weather/helpers";
import { recordRecentSearch } from "@/lib/weather/recent-searches";
import {
  fetchWeather,
  fetchWeatherByCoordinates,
  WeatherProviderError,
} from "@/lib/weather/provider";
import { getOrCreateSessionId } from "@/lib/weather/session";
import type { WeatherResponse } from "@/lib/weather/types";

export const dynamic = "force-dynamic";

function errorResponse(
  status: number,
  code: string,
  message: string,
): NextResponse {
  return NextResponse.json({ error: { code, message } }, { status });
}

function providerErrorResponse(error: WeatherProviderError): NextResponse {
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

function finalizeWeather(
  sessionId: string,
  weather: WeatherResponse,
  recordSearch: boolean,
): NextResponse {
  setCachedWeather(weather.current.city, weather);
  if (recordSearch) {
    recordRecentSearch(sessionId, {
      city: weather.current.city,
      country: weather.current.country,
    });
  }
  return NextResponse.json(weather);
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const sessionId = getOrCreateSessionId(
    request.headers.get("x-weather-session-id") ??
      request.cookies.get("weather_session_id")?.value,
  );

  const latParam = request.nextUrl.searchParams.get("lat");
  const lonParam = request.nextUrl.searchParams.get("lon");

  if (latParam !== null && lonParam !== null) {
    const lat = Number(latParam);
    const lon = Number(lonParam);

    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lon) ||
      lat < -90 ||
      lat > 90 ||
      lon < -180 ||
      lon > 180
    ) {
      return errorResponse(
        400,
        "invalid-coordinates",
        "Provide valid latitude and longitude values.",
      );
    }

    try {
      const weather = await fetchWeatherByCoordinates(lat, lon);
      return finalizeWeather(sessionId, weather, false);
    } catch (error) {
      if (error instanceof WeatherProviderError) {
        return providerErrorResponse(error);
      }
      return errorResponse(
        500,
        "unknown",
        "Something went wrong while loading the weather.",
      );
    }
  }

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
    const cachedLocationName = cachedWeather.current.city;
    const weatherWithSearchCity = {
      ...cachedWeather,
      current: {
        ...cachedWeather.current,
        city: formatCityName(city),
        neighborhood:
          cachedWeather.current.neighborhood ??
          (cachedLocationName.toLowerCase() === city.toLowerCase()
            ? undefined
            : cachedLocationName),
      },
    };
    recordRecentSearch(sessionId, {
      city: weatherWithSearchCity.current.city,
      country: weatherWithSearchCity.current.country,
    });
    return NextResponse.json(weatherWithSearchCity);
  }

  try {
    const weather = await fetchWeather(city);
    return finalizeWeather(sessionId, weather, true);
  } catch (error) {
    if (error instanceof WeatherProviderError) {
      return providerErrorResponse(error);
    }

    return errorResponse(
      500,
      "unknown",
      "Something went wrong while loading the weather.",
    );
  }
}
