"use client";

import { FormEvent, useEffect, useState } from "react";
import type {
  ApiErrorResponse,
  RecentSearch,
  WeatherResponse,
} from "@/lib/weather/types";

const sampleForecast = [
  { day: "Tomorrow", temperature: "--", icon: "☁" },
  { day: "Wednesday", temperature: "--", icon: "☀" },
  { day: "Thursday", temperature: "--", icon: "☁" },
  { day: "Friday", temperature: "--", icon: "☂" },
  { day: "Saturday", temperature: "--", icon: "☀" },
];

function weatherSymbol(iconCode: string): string {
  if (iconCode.startsWith("01")) return "☀";
  if (
    iconCode.startsWith("02") ||
    iconCode.startsWith("03") ||
    iconCode.startsWith("04")
  )
    return "☁";
  if (iconCode.startsWith("09") || iconCode.startsWith("10")) return "☂";
  if (iconCode.startsWith("11")) return "ϟ";
  if (iconCode.startsWith("13")) return "❄";
  return "◌";
}

export function WeatherDashboard() {
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
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Weather data is unavailable.",
      );
      setWeather(null);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-8 sm:px-8 lg:px-12 lg:py-12">
      <header className="flex items-center justify-between border-b border-[var(--line)] pb-6">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-2xl bg-[var(--accent)] text-xl text-white shadow-sm">
            ✦
          </span>
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--accent-dark)]">
              Skyline
            </p>
            <p className="text-xs text-[var(--ink-muted)]">Weather desk</p>
          </div>
        </div>
        <p className="hidden text-right text-sm text-[var(--ink-muted)] sm:block">
          A clear view of what&apos;s ahead
        </p>
      </header>

      <section className="grid flex-1 gap-8 py-10 lg:grid-cols-[1.1fr_1.9fr] lg:items-center lg:py-16">
        <div>
          <p className="mb-5 text-sm font-bold uppercase tracking-[0.2em] text-[var(--accent-dark)]">
            Local forecast
          </p>
          <h1 className="max-w-xl text-5xl font-semibold leading-[0.98] tracking-[-0.04em] text-[var(--foreground)] sm:text-7xl">
            Find your weather rhythm.
          </h1>
          <p className="mt-6 max-w-md text-lg leading-8 text-[var(--ink-muted)]">
            Search a city for the conditions right now and a calm, five-day look
            ahead.
          </p>

          <form
            className="mt-9 flex max-w-lg flex-col gap-3 sm:flex-row"
            onSubmit={handleSubmit}
          >
            <label className="sr-only" htmlFor="city-search">
              Search for a city
            </label>
            <input
              id="city-search"
              className="h-14 min-w-0 flex-1 rounded-2xl border border-[var(--line)] bg-white px-5 text-base outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-[#d7654230]"
              placeholder="Search city, e.g. Lisbon"
              value={city}
              onChange={(event) => setCity(event.target.value)}
              autoComplete="off"
            />
            <button
              className="h-14 rounded-2xl bg-[var(--foreground)] px-6 font-semibold text-white transition hover:bg-[var(--accent-dark)] disabled:cursor-wait disabled:opacity-60"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Reading..." : "Search"}
            </button>
          </form>

          {recentSearches.length > 0 && (
            <div
              className="mt-5 flex flex-wrap gap-2"
              aria-label="Recent searches"
            >
              {recentSearches.map((recentSearch) => (
                <button
                  key={recentSearch.city}
                  className="rounded-full border border-[var(--line)] bg-white px-3 py-1.5 text-sm text-[var(--ink-muted)]"
                  type="button"
                  onClick={() => setCity(recentSearch.city)}
                >
                  {recentSearch.city}
                </button>
              ))}
            </div>
          )}

          {error && (
            <p
              className="mt-4 text-sm font-medium text-[var(--accent-dark)]"
              role="alert"
            >
              {error}
            </p>
          )}
        </div>

        <div className="relative overflow-hidden rounded-[2rem] bg-[var(--sky)] p-6 shadow-[0_24px_70px_-38px_#537d75] sm:p-8">
          <div
            className="absolute -right-20 -top-24 size-72 rounded-full border-[30px] border-white/40"
            aria-hidden="true"
          />
          <div className="relative">
            {weather ? (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium uppercase tracking-[0.15em] text-[var(--ink-muted)]">
                      Current conditions
                    </p>
                    <h2 className="mt-2 text-3xl font-semibold">
                      {weather.current.city}
                    </h2>
                    <p className="mt-1 capitalize text-[var(--ink-muted)]">
                      {weather.current.description}
                    </p>
                  </div>
                  <p
                    className="text-6xl"
                    aria-label={weather.current.description}
                  >
                    {weatherSymbol(weather.current.iconCode)}
                  </p>
                </div>
                <p className="mt-10 text-7xl font-semibold tracking-[-0.06em]">
                  {Math.round(weather.current.temperatureCelsius)}°
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-medium uppercase tracking-[0.15em] text-[var(--ink-muted)]">
                  Your next view
                </p>
                <p className="mt-8 text-6xl">☼</p>
                <h2 className="mt-8 max-w-sm text-3xl font-semibold leading-tight">
                  The sky is waiting for a city.
                </h2>
                <p className="mt-3 max-w-sm leading-7 text-[var(--ink-muted)]">
                  Your current weather and five-day forecast will land here.
                </p>
              </>
            )}

            <div className="mt-10 grid grid-cols-3 gap-2 border-t border-[#ffffff80] pt-5 text-sm">
              <div>
                <p className="text-[var(--ink-muted)]">Humidity</p>
                <p className="mt-1 font-semibold">
                  {weather ? `${weather.current.humidityPercent}%` : "--"}
                </p>
              </div>
              <div>
                <p className="text-[var(--ink-muted)]">Wind</p>
                <p className="mt-1 font-semibold">
                  {weather
                    ? `${weather.current.windSpeedMetersPerSecond} m/s`
                    : "--"}
                </p>
              </div>
              <div>
                <p className="text-[var(--ink-muted)]">Feels like</p>
                <p className="mt-1 font-semibold">
                  {weather
                    ? `${Math.round(weather.current.feelsLikeCelsius)}°`
                    : "--"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--line)] pt-7">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--accent-dark)]">
              The week ahead
            </p>
            <h2 className="mt-2 text-2xl font-semibold">Five-day forecast</h2>
          </div>
          <p className="hidden text-sm text-[var(--ink-muted)] sm:block">
            Daily outlook
          </p>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {(weather
            ? weather.forecast.map((day) => ({
                day: new Date(day.date).toLocaleDateString(undefined, {
                  weekday: "short",
                }),
                temperature: `${Math.round(day.temperatureCelsius)}°`,
                icon: weatherSymbol(day.iconCode),
              }))
            : sampleForecast
          ).map((forecastDay) => (
            <div
              className="min-h-28 rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4"
              key={forecastDay.day}
            >
              <p className="text-sm text-[var(--ink-muted)]">
                {forecastDay.day}
              </p>
              <p className="mt-4 text-2xl">{forecastDay.icon}</p>
              <p className="mt-2 font-semibold">{forecastDay.temperature}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
