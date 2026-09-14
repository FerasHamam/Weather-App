import type { CurrentWeather } from "@/lib/weather/model";
import { WeatherIcon } from "@/components/weather-icon";

type CurrentWeatherLoadedProps = {
  current: CurrentWeather;
  fetchedAt?: string;
};

export function CurrentWeatherLoaded({
  current,
  fetchedAt,
}: CurrentWeatherLoadedProps) {
  return (
    <>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium uppercase tracking-[0.15em] text-[var(--ink-muted)]">
            Current conditions
          </p>
          <h2 className="mt-2 truncate text-3xl font-semibold">
            {current.city}
          </h2>
          <p
            className="mt-1 h-5 truncate text-sm leading-5 text-[var(--ink-muted)]"
            aria-hidden={!current.neighborhood}
          >
            {current.neighborhood ?? " "}
          </p>
          <p className="mt-1 capitalize text-[var(--ink-muted)]">
            {current.description}
          </p>
        </div>
        <WeatherIcon
          className="text-[var(--accent-dark)]"
          size={56}
          iconCode={current.iconCode}
          aria-label={current.description}
        />
      </div>
      <p className="mt-10 text-7xl font-semibold tracking-[-0.06em]">
        {Math.round(current.temperatureCelsius)}°
      </p>
      <p className="mt-2 h-5 text-xs leading-5 text-[var(--ink-muted)]">
        {fetchedAt && (
          <>
            {"Updated "}
            <time dateTime={fetchedAt}>
              {new Date(fetchedAt).toLocaleTimeString(undefined, {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </time>
          </>
        )}
      </p>
    </>
  );
}
