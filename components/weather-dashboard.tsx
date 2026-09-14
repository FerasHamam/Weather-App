"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { CurrentWeatherCard } from "@/components/current-weather-card";
import { ForecastSection } from "@/components/forecast-section";
import { WeatherSearch } from "@/components/weather-search";
import {
  isApiErrorResponse,
  type ApiErrorResponse,
  type WeatherApiResponse,
} from "@/lib/api/contract";
import type { RecentSearch } from "@/lib/weather/model";

const GENERIC_ERROR = "Weather data is unavailable.";
const GEOLOCATION_TIMEOUT_MS = 10_000;

type WeatherDashboardProps = {
  header: ReactNode;
  footer: ReactNode;
  initialRecentSearches: RecentSearch[];
};

export function WeatherDashboard({
  header,
  footer,
  initialRecentSearches,
}: WeatherDashboardProps) {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState<WeatherApiResponse | null>(null);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>(
    initialRecentSearches,
  );
  const [isSearching, setIsSearching] = useState(false);
  // Geolocation is attempted once on mount, so the first paint should show the
  // skeleton rather than the empty state. Tracked apart from `isSearching` so
  // a pending permission prompt never blocks the search form.
  const [isLocating, setIsLocating] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const requestIdRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);

  const loadWeather = useCallback(async (url: string): Promise<boolean> => {
    // Abort the in-flight request and claim a new id, so a slow earlier
    // response can never overwrite a newer one.
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const requestId = ++requestIdRef.current;
    const isCurrent = () => requestIdRef.current === requestId;

    setIsSearching(true);
    setError(null);

    try {
      const response = await fetch(url, { signal: controller.signal });
      const payload = (await response.json()) as
        | WeatherApiResponse
        | ApiErrorResponse;

      if (!response.ok || isApiErrorResponse(payload)) {
        throw new Error(
          isApiErrorResponse(payload) ? payload.error.message : GENERIC_ERROR,
        );
      }

      if (!isCurrent()) {
        return false;
      }

      setWeather(payload);
      setRecentSearches(payload.recentSearches);
      return true;
    } catch (requestError) {
      if (!isCurrent()) {
        return false;
      }
      setError(
        requestError instanceof Error ? requestError.message : GENERIC_ERROR,
      );
      return false;
    } finally {
      if (isCurrent()) {
        setIsSearching(false);
      }
    }
  }, []);

  const searchCity = useCallback(
    async (rawCity: string) => {
      const query = rawCity.trim();

      if (!query) {
        setError("Enter a city to see its forecast.");
        return;
      }

      const success = await loadWeather(
        `/api/weather?city=${encodeURIComponent(query)}`,
      );
      if (success) {
        setCity("");
      }
    },
    [loadWeather],
  );

  const requestLocation = useCallback(
    (isStale: () => boolean = () => false) => {
      if (!("geolocation" in navigator)) {
        setIsLocating(false);
        return;
      }

      setIsLocating(true);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setIsLocating(false);
          // Ignore a stale request left over from Strict Mode's mount ->
          // cleanup -> mount dev cycle.
          if (isStale()) {
            return;
          }
          const { latitude, longitude } = position.coords;
          void loadWeather(`/api/weather?lat=${latitude}&lon=${longitude}`);
        },
        () => {
          // Permission denied or unavailable: leave the dashboard as it was.
          setIsLocating(false);
        },
        { timeout: GEOLOCATION_TIMEOUT_MS },
      );
    },
    [loadWeather],
  );

  useEffect(() => {
    let stale = false;
    // One-time browser geolocation request on mount, not a state sync.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    requestLocation(() => stale);
    return () => {
      stale = true;
    };
  }, [requestLocation]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void searchCity(city);
  }

  const isLoading = isSearching || isLocating;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-8 sm:px-8 lg:px-12 lg:py-12">
      {header}

      <section className="grid flex-1 gap-8 py-8 lg:grid-cols-[1.1fr_1.9fr] lg:items-start">
        <WeatherSearch
          city={city}
          error={error}
          isSearching={isSearching}
          isLocating={isLocating}
          recentSearches={recentSearches}
          onCityChange={setCity}
          onSubmit={handleSubmit}
          onSelectRecent={(recentCity) => void searchCity(recentCity)}
          onUseMyLocation={() => requestLocation()}
        />
        <CurrentWeatherCard
          current={weather?.current ?? null}
          fetchedAt={weather?.fetchedAt}
          isLoading={isLoading}
        />
      </section>

      <ForecastSection
        forecast={weather?.forecast ?? null}
        isLoading={isLoading}
      />
      {footer}
    </main>
  );
}
