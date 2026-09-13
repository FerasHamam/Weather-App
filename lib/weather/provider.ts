import type { CurrentWeather, DailyForecast, WeatherResponse } from "./types";
import { formatCityName } from "./helpers";

const API_BASE_URL =
  process.env.OPENWEATHER_API_BASE_URL ?? "https://api.openweathermap.org";

type ProviderErrorCode =
  | "invalid-city"
  | "rate-limit"
  | "network"
  | "configuration"
  | "upstream";

export class WeatherProviderError extends Error {
  constructor(
    public readonly code: ProviderErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "WeatherProviderError";
  }
}

type Coordinates = {
  lat: number;
  lon: number;
  name: string;
  country?: string;
};

type CurrentPayload = {
  name: string;
  sys?: { country?: string };
  main: { temp: number; feels_like: number; humidity: number };
  wind?: { speed?: number };
  weather: Array<{ description: string; icon: string }>;
};

type ForecastPayload = {
  list: Array<{
    dt_txt: string;
    main: { temp: number; temp_min: number; temp_max: number };
    weather: Array<{ description: string; icon: string }>;
  }>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isCoordinates(value: unknown): value is Coordinates {
  return (
    isRecord(value) &&
    typeof value.lat === "number" &&
    typeof value.lon === "number" &&
    typeof value.name === "string"
  );
}

function isCurrentPayload(value: unknown): value is CurrentPayload {
  return (
    isRecord(value) &&
    typeof value.name === "string" &&
    isRecord(value.main) &&
    typeof value.main.temp === "number" &&
    typeof value.main.feels_like === "number" &&
    typeof value.main.humidity === "number" &&
    Array.isArray(value.weather) &&
    value.weather.length > 0 &&
    isRecord(value.weather[0]) &&
    typeof value.weather[0].description === "string" &&
    typeof value.weather[0].icon === "string"
  );
}

function isForecastPayload(value: unknown): value is ForecastPayload {
  return (
    isRecord(value) &&
    Array.isArray(value.list) &&
    value.list.every(
      (item) =>
        isRecord(item) &&
        typeof item.dt_txt === "string" &&
        isRecord(item.main) &&
        typeof item.main.temp === "number" &&
        typeof item.main.temp_min === "number" &&
        typeof item.main.temp_max === "number" &&
        Array.isArray(item.weather) &&
        item.weather.length > 0 &&
        isRecord(item.weather[0]) &&
        typeof item.weather[0].description === "string" &&
        typeof item.weather[0].icon === "string",
    )
  );
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

async function fetchProvider(url: URL): Promise<unknown> {
  try {
    const response = await fetch(url, { next: { revalidate: 0 } });
    const body = await readJson(response);

    if (response.status === 401) {
      throw new WeatherProviderError(
        "configuration",
        "The weather provider rejected the API key. Check that it is correct and active.",
      );
    }
    if (response.status === 404) {
      throw new WeatherProviderError(
        "invalid-city",
        "We could not find that city.",
      );
    }
    if (response.status === 429) {
      throw new WeatherProviderError(
        "rate-limit",
        "The weather provider is temporarily rate limited.",
      );
    }
    if (!response.ok) {
      throw new WeatherProviderError(
        "upstream",
        "The weather provider returned an error.",
      );
    }

    return body;
  } catch (error) {
    if (error instanceof WeatherProviderError) {
      throw error;
    }
    throw new WeatherProviderError(
      "network",
      "We could not reach the weather provider.",
    );
  }
}

function getApiKey(): string {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    throw new WeatherProviderError(
      "configuration",
      "Weather service configuration is missing.",
    );
  }
  return apiKey;
}

function mapForecast(payload: ForecastPayload): DailyForecast[] {
  const byDate = new Map<string, DailyForecast>();

  for (const entry of payload.list) {
    const date = entry.dt_txt.slice(0, 10);
    const existingForecast = byDate.get(date);

    if (existingForecast) {
      existingForecast.minTemperatureCelsius = Math.min(
        existingForecast.minTemperatureCelsius,
        entry.main.temp_min,
      );
      existingForecast.maxTemperatureCelsius = Math.max(
        existingForecast.maxTemperatureCelsius,
        entry.main.temp_max,
      );
      continue;
    }

    byDate.set(date, {
      date,
      temperatureCelsius: entry.main.temp,
      minTemperatureCelsius: entry.main.temp_min,
      maxTemperatureCelsius: entry.main.temp_max,
      description: entry.weather[0].description,
      iconCode: entry.weather[0].icon,
    });
  }

  return [...byDate.values()].slice(0, 5);
}

export async function fetchWeather(city: string): Promise<WeatherResponse> {
  const apiKey = getApiKey();
  const geocodeUrl = new URL(`${API_BASE_URL}/geo/1.0/direct`);
  geocodeUrl.searchParams.set("q", city);
  geocodeUrl.searchParams.set("limit", "1");
  geocodeUrl.searchParams.set("appid", apiKey);

  const geocodePayload = await fetchProvider(geocodeUrl);

  // OpenWeatherMap Returns an Array by Design [{...}]
  if (!Array.isArray(geocodePayload) || !isCoordinates(geocodePayload[0])) {
    throw new WeatherProviderError(
      "invalid-city",
      "We could not find that city.",
    );
  }

  const coordinates = geocodePayload[0];
  const currentUrl = new URL(`${API_BASE_URL}/data/2.5/weather`);
  currentUrl.searchParams.set("lat", String(coordinates.lat));
  currentUrl.searchParams.set("lon", String(coordinates.lon));
  currentUrl.searchParams.set("units", "metric");
  currentUrl.searchParams.set("appid", apiKey);

  const forecastUrl = new URL(`${API_BASE_URL}/data/2.5/forecast`);
  forecastUrl.searchParams.set("lat", String(coordinates.lat));
  forecastUrl.searchParams.set("lon", String(coordinates.lon));
  forecastUrl.searchParams.set("units", "metric");
  forecastUrl.searchParams.set("appid", apiKey);

  const [currentPayload, forecastPayload] = await Promise.all([
    fetchProvider(currentUrl),
    fetchProvider(forecastUrl),
  ]);

  if (
    !isCurrentPayload(currentPayload) ||
    !isForecastPayload(forecastPayload)
  ) {
    throw new WeatherProviderError(
      "upstream",
      "The weather provider returned unexpected data.",
    );
  }

  const currentWeather: CurrentWeather = {
    city: formatCityName(city),
    neighborhood:
      currentPayload.name.toLowerCase() === city.toLowerCase()
        ? undefined
        : currentPayload.name,
    country: currentPayload.sys?.country ?? coordinates.country ?? "",
    temperatureCelsius: currentPayload.main.temp,
    feelsLikeCelsius: currentPayload.main.feels_like,
    humidityPercent: currentPayload.main.humidity,
    windSpeedMetersPerSecond: currentPayload.wind?.speed ?? 0,
    description: currentPayload.weather[0].description,
    iconCode: currentPayload.weather[0].icon,
  };

  return {
    current: currentWeather,
    forecast: mapForecast(forecastPayload),
    cached: false,
    fetchedAt: new Date().toISOString(),
  };
}
