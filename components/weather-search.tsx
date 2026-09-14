import type { FormEvent } from "react";
import type { RecentSearch } from "@/lib/weather/types";

type WeatherSearchProps = {
  city: string;
  error: string | null;
  isLoading: boolean;
  recentSearches: RecentSearch[];
  onCityChange: (city: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function WeatherSearch({
  city,
  error,
  isLoading,
  recentSearches,
  onCityChange,
  onSubmit,
}: WeatherSearchProps) {
  return (
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
        onSubmit={onSubmit}
      >
        <label className="sr-only" htmlFor="city-search">
          Search for a city
        </label>
        <input
          id="city-search"
          className="h-[64px] min-h-[64px] w-full min-w-0 flex-1 appearance-none rounded-2xl border border-[var(--line)] bg-[var(--panel)] px-6 py-4 text-lg leading-6 text-[var(--foreground)] outline-none transition placeholder:text-[var(--ink-muted)] focus:border-[var(--accent)] focus:ring-4 focus:ring-[#d7654230] sm:h-14 sm:min-h-0 sm:w-auto sm:px-5 sm:py-0 sm:text-base"
          placeholder="Search city, e.g. Lisbon"
          value={city}
          onChange={(event) => onCityChange(event.target.value)}
          autoComplete="off"
        />
        <button
          className="flex h-16 w-full cursor-pointer items-center justify-center rounded-2xl bg-[var(--cta)] px-6 font-semibold text-white transition hover:bg-[var(--cta-hover)] disabled:cursor-wait disabled:opacity-60 sm:h-14 sm:w-32 sm:shrink-0"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? "Reading..." : "Search"}
        </button>
      </form>

      <div className="mt-5 min-h-8" aria-label="Recent searches">
        {recentSearches.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((recentSearch) => (
              <button
                key={recentSearch.city}
                className="cursor-pointer rounded-full border border-[var(--line)] bg-[var(--panel)] px-3 py-1.5 text-sm text-[var(--ink-muted)] transition hover:-translate-y-0.5 hover:border-[var(--accent)] hover:bg-[var(--accent)]/10 hover:text-[var(--accent-dark)] hover:shadow-[0_8px_20px_-12px_var(--shadow-color)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#d7654230]"
                type="button"
                onClick={() => onCityChange(recentSearch.city)}
              >
                {recentSearch.city}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 flex h-10 items-start" aria-live="polite">
        {error && (
          <p
            className="text-sm font-medium leading-5 text-[var(--accent-dark)]"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
