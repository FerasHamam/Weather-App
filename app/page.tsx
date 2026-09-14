import { cookies } from "next/headers";
import { DashboardFooter } from "@/components/dashboard-footer";
import { DashboardHeader } from "@/components/dashboard-header";
import { WeatherDashboard } from "@/components/weather-dashboard";
import { RECENT_SEARCHES_COOKIE } from "@/lib/weather/recent-searches-cookie";
import { parseRecentSearches } from "@/lib/weather/recent-searches";

export default async function Home() {
  // Read on the server so the first paint already has the user's recent
  // searches. The client only ever updates them from the weather response,
  // which is the request that changes them.
  const cookieStore = await cookies();
  const recentSearches = parseRecentSearches(
    cookieStore.get(RECENT_SEARCHES_COOKIE)?.value,
  );

  return (
    <WeatherDashboard
      header={<DashboardHeader />}
      footer={<DashboardFooter />}
      initialRecentSearches={recentSearches}
    />
  );
}
