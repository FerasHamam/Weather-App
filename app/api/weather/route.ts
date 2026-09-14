import { NextResponse, type NextRequest } from "next/server";
import {
  API_ERROR_STATUS,
  type ApiErrorCode,
  type WeatherApiResponse,
} from "@/lib/api/contract";
import { getCachedWeather, setCachedWeather } from "@/lib/weather/cache";
import { normalizeCity } from "@/lib/weather/city-name";
import type { RecentSearch, Weather } from "@/lib/weather/model";
import {
  fetchWeather,
  fetchWeatherByCoordinates,
  WeatherError,
} from "@/lib/weather/provider";
import { withRecentSearch } from "@/lib/weather/recent-searches";
import {
  readRecentSearches,
  writeRecentSearches,
} from "@/lib/weather/recent-searches-cookie";

const MIN_CITY_LENGTH = 2;
const MAX_CITY_LENGTH = 100;

function errorResponse(code: ApiErrorCode, message: string): NextResponse {
  return NextResponse.json(
    { error: { code, message } },
    { status: API_ERROR_STATUS[code] },
  );
}

function failureResponse(error: unknown): NextResponse {
  if (error instanceof WeatherError) {
    if (error.cause) {
      console.error(`weather request failed (${error.code}):`, error.cause);
    }
    return errorResponse(error.code, error.message);
  }

  console.error("weather request failed:", error);
  return errorResponse(
    "unknown",
    "Something went wrong while loading the weather.",
  );
}

function weatherResponse(
  payload: WeatherApiResponse,
  recentSearches?: RecentSearch[],
): NextResponse {
  const response = NextResponse.json(payload);
  if (recentSearches) {
    writeRecentSearches(response, recentSearches);
  }
  return response;
}

async function getWeatherByCoordinates(
  request: NextRequest,
  latParam: string,
  lonParam: string,
): Promise<NextResponse> {
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
      "invalid-coordinates",
      "Provide valid latitude and longitude values.",
    );
  }

  try {
    const weather = await fetchWeatherByCoordinates(lat, lon);
    const fetchedAt = new Date().toISOString();

    // Deliberately not cached: these results are keyed to one person's exact
    // position, so filing them under a city name would serve a suburb's
    // weather to everyone who later searches that city.
    // Geolocation lookups are not recorded as recent searches either.
    return weatherResponse({
      ...weather,
      cached: false,
      fetchedAt,
      recentSearches: readRecentSearches(request),
    });
  } catch (error) {
    return failureResponse(error);
  }
}

function respondWithWeather(
  request: NextRequest,
  weather: Weather,
  fetchedAt: string,
  cached: boolean,
): NextResponse {
  const recentSearches = withRecentSearch(readRecentSearches(request), {
    city: weather.current.city,
    country: weather.current.country,
  });

  return weatherResponse(
    { ...weather, cached, fetchedAt, recentSearches },
    recentSearches,
  );
}

async function getWeatherByCity(
  request: NextRequest,
  cityParam: string,
): Promise<NextResponse> {
  const city = normalizeCity(cityParam);

  if (city.length < MIN_CITY_LENGTH || city.length > MAX_CITY_LENGTH) {
    return errorResponse(
      "invalid-query",
      `Enter a city name between ${MIN_CITY_LENGTH} and ${MAX_CITY_LENGTH} characters.`,
    );
  }

  const cached = getCachedWeather(city);
  if (cached) {
    return respondWithWeather(request, cached.weather, cached.fetchedAt, true);
  }

  try {
    const weather = await fetchWeather(city);
    const fetchedAt = new Date().toISOString();

    // Stored under the search term as well as the resolved name, so "NYC" and
    // "New York" share one entry instead of each paying for its own lookup.
    setCachedWeather([city, weather.current.city], { weather, fetchedAt });

    return respondWithWeather(request, weather, fetchedAt, false);
  } catch (error) {
    return failureResponse(error);
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const params = request.nextUrl.searchParams;
  const lat = params.get("lat");
  const lon = params.get("lon");

  return lat !== null && lon !== null
    ? getWeatherByCoordinates(request, lat, lon)
    : getWeatherByCity(request, params.get("city") ?? "");
}
