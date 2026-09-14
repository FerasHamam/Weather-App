import {
  Cloud,
  CloudDrizzle,
  CloudLightning,
  CloudRain,
  CloudSnow,
  Moon,
  Sun,
} from "@/components/icons";

type WeatherIconProps = {
  iconCode: string;
  className?: string;
  size?: string | number;
  "aria-label"?: string;
};

export function WeatherIcon({
  iconCode,
  className,
  size = 24,
  "aria-label": ariaLabel,
}: WeatherIconProps) {
  const iconProps = {
    className,
    size,
    role: "img" as const,
    "aria-label": ariaLabel ?? "Weather condition",
  };

  if (iconCode.startsWith("01")) {
    return iconCode.endsWith("n") ? (
      <Moon {...iconProps} />
    ) : (
      <Sun {...iconProps} />
    );
  }
  if (
    iconCode.startsWith("02") ||
    iconCode.startsWith("03") ||
    iconCode.startsWith("04")
  ) {
    return <Cloud {...iconProps} />;
  }
  if (iconCode.startsWith("09")) return <CloudDrizzle {...iconProps} />;
  if (iconCode.startsWith("10")) return <CloudRain {...iconProps} />;
  if (iconCode.startsWith("11")) return <CloudLightning {...iconProps} />;
  if (iconCode.startsWith("13")) return <CloudSnow {...iconProps} />;
  return <Cloud {...iconProps} />;
}
