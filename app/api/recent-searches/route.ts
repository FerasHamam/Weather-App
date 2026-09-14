import { NextRequest, NextResponse } from "next/server";
import { readRecentSearches } from "@/lib/weather/recent-searches";

export const dynamic = "force-dynamic";

export function GET(request: NextRequest): NextResponse {
  return NextResponse.json({ searches: readRecentSearches(request) });
}
