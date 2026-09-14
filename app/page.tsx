import { DashboardFooter } from "@/components/dashboard-footer";
import { DashboardHeader } from "@/components/dashboard-header";
import { WeatherDashboard } from "@/components/weather-dashboard";

export default function Home() {
  return (
    <WeatherDashboard
      header={<DashboardHeader />}
      footer={<DashboardFooter />}
    />
  );
}
