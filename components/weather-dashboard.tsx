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
  // Starts true: geolocation is always attempted on mount, so the first
  // paint should show the loading skeleton, never the empty idle state.
  const [isLoading, setIsLoading] = useState(true);
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

  async function loadWeather(url: string): Promise<boolean> {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(url);
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
      return true;
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Weather data is unavailable.",
      );
      return false;
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedCity = city.trim();

    if (!normalizedCity) {
      setError("Enter a city to see its forecast.");
      return;
    }

    const success = await loadWeather(
      `/api/weather?city=${encodeURIComponent(normalizedCity)}`,
    );
    if (success) {
      setCity("");
    }
  }

  function requestLocation(isStale: () => boolean = () => false) {
    if (!("geolocation" in navigator)) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Ignore a stale request left over from Strict Mode's mount ->
        // cleanup -> mount dev cycle, so it can't clobber a newer result.
        if (isStale()) {
          return;
        }
        void loadWeather(
          `/api/weather?lat=${position.coords.latitude}&lon=${position.coords.longitude}`,
        );
      },
      () => {
        if (isStale()) {
          return;
        }
        // Permission denied or unavailable: leave the dashboard as it was.
        setIsLoading(false);
      },
      { timeout: 10_000 },
    );
  }

  function handleUseMyLocation() {
    requestLocation();
  }

  useEffect(() => {
    let stale = false;
    // One-time browser geolocation request on mount, not a state sync.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    requestLocation(() => stale);
    return () => {
      stale = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          onUseMyLocation={handleUseMyLocation}
        />
        <CurrentWeatherCard weather={weather} isLoading={isLoading} />
      </section>

      <ForecastSection weather={weather} isLoading={isLoading} />
      {footer}
    </main>
  );
}
