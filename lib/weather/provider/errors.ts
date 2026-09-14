export type ProviderErrorCode =
  | "invalid-city"
  | "rate-limit"
  | "network"
  | "configuration"
  | "upstream";

/**
 * A failure that is safe to show a user.
 *
 * `message` is user-facing copy and is serialized to the client, so anything
 * diagnostic belongs in `cause` instead — the route logs it server-side and
 * never puts it on the wire.
 */
export class WeatherError extends Error {
  readonly code: ProviderErrorCode;

  constructor(
    code: ProviderErrorCode,
    message: string,
    options?: { cause?: unknown },
  ) {
    super(message, options);
    this.name = "WeatherError";
    this.code = code;
  }
}
