import { Droplet, Thermometer, Wind } from "@deemlol/next-icons";
import type { WeatherResponse } from "@/lib/weather/types";
import { CurrentWeatherEmpty } from "./empty";
import { CurrentWeatherLoaded } from "./loaded";
import { CurrentWeatherSkeleton } from "./skeleton";
import { StatItem } from "./stat-item";

type CurrentWeatherCardProps = {
  weather: WeatherResponse | null;
  isLoading?: boolean;
};

export function CurrentWeatherCard({
  weather,
  isLoading = false,
}: CurrentWeatherCardProps) {
  return (
    <div className="relative flex h-[26rem] flex-col overflow-hidden rounded-[2rem] bg-[var(--sky)] p-6 shadow-[0_24px_70px_-38px_var(--shadow-color)] sm:h-[28rem] sm:p-8">
      <div
        className="absolute -right-20 -top-24 size-72 rounded-full border-[30px] border-[var(--decorative-ring)]"
        aria-hidden="true"
      />
      <div
        className="relative flex min-h-0 flex-1 flex-col"
        aria-busy={isLoading}
      >
        {isLoading ? (
          <CurrentWeatherSkeleton />
        ) : weather ? (
          <CurrentWeatherLoaded weather={weather} />
        ) : (
          <CurrentWeatherEmpty />
        )}

        <div className="mt-auto grid grid-cols-3 gap-3 border-t border-[var(--divider)] pt-6 text-sm">
          <StatItem
            icon={<Droplet size={18} className="text-[var(--accent-dark)]" />}
            label="Humidity"
            value={weather ? `${weather.current.humidityPercent}%` : "--"}
            isLoading={isLoading}
          />
          <StatItem
            icon={<Wind size={18} className="text-[var(--accent-dark)]" />}
            label="Wind"
            value={
              weather
                ? `${weather.current.windSpeedMetersPerSecond} m/s`
                : "--"
            }
            isLoading={isLoading}
          />
          <StatItem
            icon={
              <Thermometer size={18} className="text-[var(--accent-dark)]" />
            }
            label="Feels like"
            value={
              weather
                ? `${Math.round(weather.current.feelsLikeCelsius)}°`
                : "--"
            }
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
