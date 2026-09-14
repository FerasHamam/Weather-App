import { Droplet, Thermometer, Wind } from "@/components/icons";
import type { ReactNode } from "react";
import type { CurrentWeather } from "@/lib/weather/model";
import { CurrentWeatherEmpty } from "./empty";
import { CurrentWeatherLoaded } from "./loaded";
import { CurrentWeatherSkeleton } from "./skeleton";
import { StatItem } from "./stat-item";

type Stat = {
  label: string;
  icon: ReactNode;
  format: (current: CurrentWeather) => string;
};

const iconClassName = "text-[var(--accent-dark)]";

const STATS: Stat[] = [
  {
    label: "Humidity",
    icon: <Droplet size={18} className={iconClassName} />,
    format: (current) => `${current.humidityPercent}%`,
  },
  {
    label: "Wind",
    icon: <Wind size={18} className={iconClassName} />,
    format: (current) => `${Math.round(current.windSpeedMetersPerSecond)} m/s`,
  },
  {
    label: "Feels like",
    icon: <Thermometer size={18} className={iconClassName} />,
    format: (current) => `${Math.round(current.feelsLikeCelsius)}°`,
  },
];

type CurrentWeatherCardProps = {
  current: CurrentWeather | null;
  fetchedAt?: string;
  isLoading?: boolean;
};

export function CurrentWeatherCard({
  current,
  fetchedAt,
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
        ) : current ? (
          <CurrentWeatherLoaded current={current} fetchedAt={fetchedAt} />
        ) : (
          <CurrentWeatherEmpty />
        )}

        <div className="mt-auto grid grid-cols-3 gap-3 border-t border-[var(--divider)] pt-6 text-sm">
          {STATS.map((stat) => (
            <StatItem
              key={stat.label}
              icon={stat.icon}
              label={stat.label}
              value={current ? stat.format(current) : "--"}
              isLoading={isLoading}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
