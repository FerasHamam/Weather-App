import { NextResponse } from "next/server";
import { listRecentSearches } from "@/lib/weather/recent-searches";

export const dynamic = "force-dynamic";

export function GET(): NextResponse {
  return NextResponse.json({ searches: listRecentSearches() });
}
