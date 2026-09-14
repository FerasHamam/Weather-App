"use client";

import { FormEvent, ReactNode, useEffect, useState } from "react";
import { CurrentWeatherCard } from "@/components/current-weather-card";
import { ForecastSection } from "@/components/forecast-section";
import { WeatherSearch } from "@/components/weather-search";
import type {
  ApiErrorResponse,
  RecentSearch,
  WeatherResponse,
} from "@/lib/weather/types";

type WeatherDashboardProps = {
  header: ReactNode;
  footer: ReactNode;
};

export function WeatherDashboard({ header, footer }: WeatherDashboardProps) {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState<WeatherResponse | null>(null);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetch("/api/recent-searches")
      .then(async (response) => {
        if (!response.ok) return;
        const payload = (await response.json()) as {
          searches?: RecentSearch[];
        };
        setRecentSearches(payload.searches ?? []);
      })
      .catch(() => undefined);
  }, [weather]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedCity = city.trim();

    if (!normalizedCity) {
      setError("Enter a city to see its forecast.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/weather?city=${encodeURIComponent(normalizedCity)}`,
      );
      const payload = (await response.json()) as
        | WeatherResponse
        | ApiErrorResponse;

      if (!response.ok || "error" in payload) {
        throw new Error(
          "error" in payload
            ? payload.error.message
            : "Weather data is unavailable.",
        );
      }

      setWeather(payload);
      setCity("");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Weather data is unavailable.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-8 sm:px-8 lg:px-12 lg:py-12">
      {header}

      <section className="grid flex-1 gap-8 py-10 lg:grid-cols-[1.1fr_1.9fr] lg:items-center lg:py-16">
        <WeatherSearch
          city={city}
          error={error}
          isLoading={isLoading}
          recentSearches={recentSearches}
          onCityChange={setCity}
          onSubmit={handleSubmit}
        />
        <CurrentWeatherCard weather={weather} />
      </section>

      <ForecastSection weather={weather} />
      {footer}
    </main>
  );
}
