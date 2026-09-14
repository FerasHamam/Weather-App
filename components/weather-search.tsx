import type { SubmitEvent } from "react";
import { MapPin } from "@/components/icons";
import type { RecentSearch } from "@/lib/weather/model";

type WeatherSearchProps = {
  city: string;
  error: string | null;
  isSearching: boolean;
  isLocating: boolean;
  recentSearches: RecentSearch[];
  onCityChange: (city: string) => void;
  onSubmit: (event: SubmitEvent<HTMLFormElement>) => void;
  onSelectRecent: (city: string) => void;
  onUseMyLocation: () => void;
};

export function WeatherSearch({
  city,
  error,
  isSearching,
  isLocating,
  recentSearches,
  onCityChange,
  onSubmit,
  onSelectRecent,
  onUseMyLocation,
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
          className="h-[64px] min-h-[64px] w-full min-w-0 flex-1 appearance-none rounded-2xl border border-[var(--line)] bg-[var(--panel)] px-6 py-4 text-lg leading-6 text-[var(--foreground)] outline-none transition placeholder:text-[var(--ink-muted)] focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--focus-ring)] sm:h-14 sm:min-h-0 sm:w-auto sm:px-5 sm:py-0 sm:text-base"
          placeholder="Search city, e.g. Lisbon"
          value={city}
          onChange={(event) => onCityChange(event.target.value)}
          autoComplete="off"
        />
        <button
          className="flex h-16 w-full cursor-pointer items-center justify-center rounded-2xl bg-[var(--cta)] px-6 font-semibold text-white transition hover:bg-[var(--cta-hover)] disabled:cursor-wait disabled:opacity-60 sm:h-14 sm:w-32 sm:shrink-0"
          type="submit"
          disabled={isSearching}
        >
          {isSearching ? "Reading..." : "Search"}
        </button>
      </form>

      <div className="my-0 flex min-h-5 items-start" role="status">
        {error && (
          <p className="text-sm font-medium leading-5 text-[var(--accent-dark)]">
            {error}
          </p>
        )}
      </div>

      <button
        className="mt-0 inline-flex cursor-pointer items-center gap-1.5 text-sm font-medium text-[var(--ink-muted)] transition hover:text-[var(--accent-dark)] disabled:cursor-wait disabled:opacity-60"
        type="button"
        onClick={onUseMyLocation}
        disabled={isSearching || isLocating}
      >
        <MapPin size={16} />
        {isLocating ? "Finding you..." : "Use my location"}
      </button>

      <nav
        className={`overflow-hidden lg:mt-3 lg:h-[160px] lg:p-2 ${
          recentSearches.length > 0 ? "mt-3 h-[140px] p-2" : "h-0"
        }`}
        aria-label="Recent searches"
      >
        {recentSearches.length > 0 && (
          <ul className="flex list-none flex-wrap gap-2 p-0">
            {recentSearches.map((recentSearch) => (
              <li key={recentSearch.city} className="max-w-full">
                <button
                  className="flex max-w-[10rem] cursor-pointer items-center rounded-full border border-[var(--line)] bg-[var(--panel)] px-3 py-1.5 text-sm text-[var(--ink-muted)] transition hover:-translate-y-0.5 hover:border-[var(--accent)] hover:bg-[var(--accent)]/10 hover:text-[var(--accent-dark)] hover:shadow-[0_8px_20px_-12px_var(--shadow-color)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--focus-ring)] disabled:cursor-wait disabled:opacity-60"
                  type="button"
                  title={recentSearch.city}
                  onClick={() => onSelectRecent(recentSearch.city)}
                  disabled={isSearching}
                >
                  <span className="min-w-0 truncate">
                    {recentSearch.city}
                  </span>
                  {recentSearch.country && (
                    <span className="ml-1 shrink-0 opacity-60">
                      {recentSearch.country}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </nav>
    </div>
  );
}
