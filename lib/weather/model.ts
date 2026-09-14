/**
 * Application-owned weather types.
 *
 * These describe the domain only. Transport concerns (cache metadata, HTTP
 * error envelopes) live in `lib/api/contract.ts`, and OpenWeatherMap's wire
 * shapes live in `lib/weather/provider/dto.ts`, so provider details never
 * reach the UI.
 */

export interface CurrentWeather {
  city: string;
  /** Set only when the provider's locality differs from the resolved city. */
  neighborhood?: string;
  country: string;
  temperatureCelsius: number;
  feelsLikeCelsius: number;
  humidityPercent: number;
  windSpeedMetersPerSecond: number;
  description: string;
  iconCode: string;
}

export interface DailyForecast {
  /** Calendar date in UTC, `YYYY-MM-DD`, as the provider buckets it. */
  date: string;
  minTemperatureCelsius: number;
  maxTemperatureCelsius: number;
  description: string;
  iconCode: string;
}

export interface Weather {
  current: CurrentWeather;
  forecast: DailyForecast[];
}

export interface RecentSearch {
  city: string;
  country?: string;
}
