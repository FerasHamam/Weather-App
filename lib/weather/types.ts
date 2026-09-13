export interface CurrentWeather {
  city: string;
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
  date: string;
  temperatureCelsius: number;
  minTemperatureCelsius: number;
  maxTemperatureCelsius: number;
  description: string;
  iconCode: string;
}

export interface WeatherResponse {
  current: CurrentWeather;
  forecast: DailyForecast[];
  cached: boolean;
  fetchedAt: string;
}

export interface RecentSearch {
  city: string;
  country?: string;
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
  };
}
