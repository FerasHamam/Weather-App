import "server-only";

import type { Weather } from "@/lib/weather/model";
import {
  isCoordinates,
  isCurrentPayload,
  readForecastEntries,
  type Coordinates,
  type CurrentPayload,
  type ForecastEntry,
} from "./dto";
import { WeatherError } from "./errors";
import { toCurrentWeather, toDailyForecasts } from "./mappers";

export { WeatherError, type ProviderErrorCode } from "./errors";

const API_BASE_URL =
  process.env.OPENWEATHER_API_BASE_URL ?? "https://api.openweathermap.org";

/** Upstream is a hard dependency of every request, so it must not hang. */
const UPSTREAM_TIMEOUT_MS = 8_000;

function getApiKey(): string {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    throw new WeatherError(
      "configuration",
      "Weather service configuration is missing.",
    );
  }
  return apiKey;
}

function providerUrl(
  path: string,
  params: Record<string, string | number>,
): URL {
  const url = new URL(`${API_BASE_URL}${path}`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, String(value));
  }
  return url;
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function statusError(status: number): WeatherError | null {
  if (status === 401 || status === 403) {
    return new WeatherError(
      "configuration",
      "The weather provider rejected the API key. Check that it is correct and active.",
    );
  }
  if (status === 404) {
    return new WeatherError("invalid-city", "We could not find that city.");
  }
  if (status === 429) {
    return new WeatherError(
      "rate-limit",
      "The weather provider is temporarily rate limited.",
    );
  }
  return null;
}

async function fetchProvider(url: URL): Promise<unknown> {
  let response: Response;

  try {
    response = await fetch(url, {
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });
  } catch (error) {
    // Only transport failures reach here: a timeout, a DNS/TLS error, or a
    // dropped connection. Anything else is a bug and must not be disguised as
    // a network problem, so it is rethrown untouched.
    if (error instanceof DOMException || error instanceof TypeError) {
      throw new WeatherError(
        "network",
        "We could not reach the weather provider.",
        { cause: error },
      );
    }
    throw error;
  }

  const body = await readJson(response);

  const knownError = statusError(response.status);
  if (knownError) {
    throw knownError;
  }
  if (!response.ok) {
    throw new WeatherError(
      "upstream",
      "The weather provider returned an error.",
      { cause: new Error(`${url.pathname} responded ${response.status}`) },
    );
  }

  return body;
}

async function fetchCurrentAndForecast(
  lat: number,
  lon: number,
  apiKey: string,
): Promise<{ current: CurrentPayload; forecast: ForecastEntry[] }> {
  const params = { lat, lon, units: "metric", appid: apiKey };

  const [currentPayload, forecastPayload] = await Promise.all([
    fetchProvider(providerUrl("/data/2.5/weather", params)),
    fetchProvider(providerUrl("/data/2.5/forecast", params)),
  ]);

  const forecast = readForecastEntries(forecastPayload);

  if (!isCurrentPayload(currentPayload) || !forecast) {
    throw new WeatherError(
      "upstream",
      "The weather provider returned unexpected data.",
    );
  }

  return { current: currentPayload, forecast };
}

async function reverseGeocode(
  lat: number,
  lon: number,
  apiKey: string,
): Promise<Coordinates | null> {
  try {
    const payload = await fetchProvider(
      providerUrl("/geo/1.0/reverse", { lat, lon, limit: 1, appid: apiKey }),
    );
    if (Array.isArray(payload) && isCoordinates(payload[0])) {
      return payload[0];
    }
  } catch {
    // Reverse geocoding is a convenience for the user.
    // I handled it by falling back to the current.name
  }
  return null;
}

async function geocodeCity(city: string, apiKey: string): Promise<Coordinates> {
  const payload = await fetchProvider(
    providerUrl("/geo/1.0/direct", { q: city, limit: 1, appid: apiKey }),
  );

  // OpenWeatherMap returns an array by design; an empty one means no match.
  if (!Array.isArray(payload) || !isCoordinates(payload[0])) {
    throw new WeatherError("invalid-city", "We could not find that city.");
  }

  return payload[0];
}

function toWeather(
  current: CurrentPayload,
  forecast: ForecastEntry[],
  resolved: { name: string; country?: string },
): Weather {
  return {
    current: toCurrentWeather(current, resolved),
    forecast: toDailyForecasts(forecast),
  };
}

export async function fetchWeather(city: string): Promise<Weather> {
  const apiKey = getApiKey();
  const coordinates = await geocodeCity(city, apiKey);

  const { current, forecast } = await fetchCurrentAndForecast(
    coordinates.lat,
    coordinates.lon,
    apiKey,
  );

  // The forward geocode already returned the canonical name, so there is no
  // reverse lookup to make here.
  return toWeather(current, forecast, coordinates);
}

export async function fetchWeatherByCoordinates(
  lat: number,
  lon: number,
): Promise<Weather> {
  const apiKey = getApiKey();

  const [{ current, forecast }, reverseGeocoded] = await Promise.all([
    fetchCurrentAndForecast(lat, lon, apiKey),
    // No search term to fall back on here, so the reverse lookup is what turns
    // a coordinate pair into a city name.
    reverseGeocode(lat, lon, apiKey),
  ]);

  return toWeather(
    current,
    forecast,
    reverseGeocoded ?? { name: current.name },
  );
}
