import type { WeatherResponse } from "@/lib/weather/types";
import { WeatherIcon } from "@/components/weather-icon";

type CurrentWeatherLoadedProps = {
  weather: WeatherResponse;
};

export function CurrentWeatherLoaded({ weather }: CurrentWeatherLoadedProps) {
  return (
    <>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium uppercase tracking-[0.15em] text-[var(--ink-muted)]">
            Current conditions
          </p>
          <h2 className="mt-2 truncate text-3xl font-semibold">
            {weather.current.city}
          </h2>
          <p
            className="mt-1 h-5 truncate text-sm leading-5 text-[var(--ink-muted)]"
            aria-hidden={!weather.current.neighborhood}
          >
            {weather.current.neighborhood ?? " "}
          </p>
          <p className="mt-1 capitalize text-[var(--ink-muted)]">
            {weather.current.description}
          </p>
        </div>
        <WeatherIcon
          className="text-[var(--accent-dark)]"
          size={56}
          iconCode={weather.current.iconCode}
          aria-label={weather.current.description}
        />
      </div>
      <p className="mt-10 text-7xl font-semibold tracking-[-0.06em]">
        {Math.round(weather.current.temperatureCelsius)}°
      </p>
    </>
  );
}
