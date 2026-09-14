import type { RecentSearch, Weather } from "@/lib/weather/model";
import type { ProviderErrorCode } from "@/lib/weather/provider/errors";

/**
 * Every code `/api/weather` can emit. Extending `ProviderErrorCode` means a new
 * provider failure mode cannot be added without the status table below failing
 * to compile.
 */
export type ApiErrorCode =
  | ProviderErrorCode
  | "invalid-query"
  | "invalid-coordinates"
  | "unknown";

export const API_ERROR_STATUS: Record<ApiErrorCode, number> = {
  "invalid-query": 400,
  "invalid-coordinates": 400,
  "invalid-city": 404,
  "rate-limit": 429,
  configuration: 500,
  network: 503,
  upstream: 502,
  unknown: 500,
};

export interface ApiErrorResponse {
  error: {
    code: ApiErrorCode;
    message: string;
  };
}

/**
 * The weather payload plus the metadata only the transport layer knows:
 * whether it was served from cache, when it was fetched upstream, and the
 * recent-search list as it stands after this request. Returning the list here
 * keeps the client from making a second round trip for state this request
 * just changed.
 */
export interface WeatherApiResponse extends Weather {
  cached: boolean;
  fetchedAt: string;
  recentSearches: RecentSearch[];
}

export function isApiErrorResponse(
  payload: WeatherApiResponse | ApiErrorResponse,
): payload is ApiErrorResponse {
  return "error" in payload;
}
