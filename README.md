# Skyline Weather

A full-stack weather dashboard. Search for a city to see current conditions and a five-day forecast.

## Stack

- Next.js App Router
- Bun
- TypeScript with strict type checking
- Tailwind CSS
- OpenWeatherMap
- Bun test runner

## Setup

Prerequisites: Bun and an OpenWeatherMap API key.

```bash
bun install
cp .env.example .env
```

Set `OPENWEATHER_API_KEY` in `.env`. `OPENWEATHER_API_BASE_URL` is also present and defaults to `https://api.openweathermap.org`; leave it as-is unless you need to point at a different endpoint. Then run:

```bash
bun run dev
```

Open http://localhost:3000.

## Verification

```bash
bun test
bun run typecheck
bun run lint
bun run build
```

## Architecture

`GET /api/weather` takes either `?city=...` or `?lat=...&lon=...` (the "use my location" flow). A city search first checks a ten-minute in-memory cache keyed by the normalized city name; only on a miss does it call the server-only OpenWeatherMap adapter, which geocodes the city to coordinates and then fetches current weather and the forecast. A coordinates search reverse-geocodes to a city name instead, and is deliberately not cached or saved as a recent search, since it is tied to one exact position rather than a searchable city. Provider DTOs are mapped into application-owned types before the response, so upstream shapes never reach the client.

Recent searches (five most recent unique cities) have no separate endpoint: they travel as a field on the `/api/weather` response and are written back as an anonymous `HttpOnly` cookie, and `app/page.tsx` reads that cookie server-side to seed the first paint. (Please read my note below about this point).

I chose a setup that actually works on Vercel over a more advanced one that wouldn't: Vercel runs the app as separate serverless instances, and it [only reuses a warm instance on a best-effort basis](https://vercel.com/blog/evolving-vercel-functions) — there's no guarantee two requests, even from the same user, land on the same one, and an idle function gets [archived and cold-started](https://vercel.com/docs/functions/runtimes) on its next invocation. So anything stored in a single instance's memory (a cache, a session map, a SQLite file in `/tmp`) can disappear or get out of sync between requests, not because it's wiped every time, but because persistence is never guaranteed. That's why the weather cache is a simple in-memory `Map`, and why recent searches are stored in the cookie itself instead of on the server, so they work reliably no matter which instance handles the request. I originally gave each anonymous user a session UUID and used it as a key into a server side store of their recent searches, but that ran into the same problem: the store would need to live in memory on one instance, so it dropped or diverged depending on which instance served the request. Storing the searches directly in the cookie sidesteps that entirely. In a real production setup, I'd replace the cache with something shared across instances, like Redis.

**Note on point 4 and the bonus SQLite requirement**

I tried using Bun's built-in SQLite (`bun:sqlite`) to make recent searches durable. it works fine locally after adding `serverExternalPackages: ["bun:sqlite"]` to `next.config.ts`. But it doesn't hold up on Vercel: the filesystem there is read-only outside of `/tmp`, `/tmp` isn't guaranteed to persist between invocations or be shared across instances, and there's no guarantee two requests even land on the same instance. So a local SQLite file can't actually be durable in that environment. In production, I'd use a proper networked database instead, which would also make it easier to build insights and metrics later.

## Error behavior

Input is validated before any provider call: `city` must normalize to 2–100 characters, and `lat`/`lon` must be finite numbers within `[-90, 90]`/`[-180, 180]`. The API returns user-safe JSON errors without exposing provider internals: `400` for invalid input, `404` for an unknown city, `429` for provider rate limiting, `502` for an unexpected upstream response, `503` for a network/timeout failure, and `500` for a missing API key or anything unanticipated. The UI surfaces these messages as-is.

## Improvements if I had more time

1. Improve city alias handling so searches such as `NYC` and `New York City` resolve to the same canonical city and share the same cache entry. Currently, they may produce the same weather output but are cached separately.
2. Spend more time detailing and refining the frontend to improve the overall user experience. Also spend more time learning about Tailwind/Bootstrap, as it has been a while since I last used them seriously. (I have depended on AI to make the UI responsive and to eliminate any shifts that might affect the Lighthouse web vitals score.)
3. I would use AI to summarize the forecast for each day because the API provides multiple weather descriptions across different timelines. Currently I am using the midday to represent the whole day.
4. Research the best way to visualize this data for expressiveness and effectiveness. ([reference](https://medium.com/vitrox-publication/evaluating-expressiveness-and-effectiveness-of-informative-charts-9f0455474bf1))
