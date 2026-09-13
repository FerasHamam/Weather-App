import { Droplet, Thermometer, Wind } from "@deemlol/next-icons";
import type { WeatherResponse } from "@/lib/weather/types";
import { WeatherIcon } from "@/components/weather-icon";

type CurrentWeatherCardProps = {
  weather: WeatherResponse | null;
};

export function CurrentWeatherCard({ weather }: CurrentWeatherCardProps) {
  return (
    <div className="relative min-h-[26rem] overflow-hidden rounded-[2rem] bg-[var(--sky)] p-6 shadow-[0_24px_70px_-38px_#537d75] sm:min-h-[28rem] sm:p-8">
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
                <h2 className="mt-2 truncate text-3xl font-semibold">
                  {weather.current.city}
                </h2>
                <p className="mt-1 truncate text-sm text-[var(--ink-muted)]">
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

        <div className="mt-10 grid grid-cols-3 gap-3 border-t border-[#ffffff80] pt-6 text-sm">
          <div className="flex flex-col items-start gap-2 rounded-2xl bg-white/50 p-3">
            <Droplet size={18} className="text-[var(--accent-dark)]" />
            <div>
              <p className="text-[var(--ink-muted)]">Humidity</p>
              <p className="mt-0.5 text-base font-semibold">
                {weather ? `${weather.current.humidityPercent}%` : "--"}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-start gap-2 rounded-2xl bg-white/50 p-3">
            <Wind size={18} className="text-[var(--accent-dark)]" />
            <div>
              <p className="text-[var(--ink-muted)]">Wind</p>
              <p className="mt-0.5 text-base font-semibold">
                {weather
                  ? `${weather.current.windSpeedMetersPerSecond} m/s`
                  : "--"}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-start gap-2 rounded-2xl bg-white/50 p-3">
            <Thermometer size={18} className="text-[var(--accent-dark)]" />
            <div>
              <p className="text-[var(--ink-muted)]">Feels like</p>
              <p className="mt-0.5 text-base font-semibold">
                {weather
                  ? `${Math.round(weather.current.feelsLikeCelsius)}°`
                  : "--"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
