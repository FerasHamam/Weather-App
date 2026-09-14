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
cp .env.example .env.local
```

Set `OPENWEATHER_API_KEY` in `.env.local`, then run:

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

The browser calls the Next.js Route Handler at `GET /api/weather?city=...`. The handler validates input, checks a normalized city key in a ten-minute in-memory cache, calls the server-only OpenWeatherMap adapter on a miss, maps provider data into application-owned types, and records successful searches. Recent searches are available from `GET /api/recent-searches` and are limited to the five most recent unique cities.

Provider DTOs are kept separate from UI types so OpenWeatherMap response details do not leak into the client. The dashboard is a client component because it owns form input and request state; the page and layout remain server-rendered composition boundaries. API keys are read only in server modules.

The cache and recent-search store are intentionally lightweight for the assessment and require no external database. Weather caching is shared by the server process because weather data is public. Recent searches are scoped by an anonymous `HttpOnly` session cookie, so browser sessions do not see one another's search history. Both stores are local to a running process, so separate serverless instances may not share them and they are not durable across restarts. A production version would use a shared cache and durable store such as Redis or a managed database.

## Error behavior

The API returns user-safe JSON errors with status codes for invalid input (`400`), unknown cities (`404`), provider rate limits (`429`), network failures (`503`), and upstream failures (`502`). The UI presents these errors without exposing provider internals.

## Improvements if I had more time

1. Improve city alias handling so searches such as `NYC` and `New York City` resolve to the same canonical city and share the same cache entry. Currently, they may produce the same weather output but are cached separately.
2. Spend more time detailing and refining the frontend to improve the overall user experience. Also spend more time learning about Tailwind/Bootstrap, as it has been a while since I last used them seriously. (I have depended on AI to make the UI responsive and to eliminate any shifts that might affect the Lighthouse web vitals score.)
3. I would use AI to summarize the forecast for each day because the API provides multiple weather descriptions across different timelines.
4. Research the best way to visualize this data for expressiveness and effectiveness. ([reference](https://medium.com/vitrox-publication/evaluating-expressiveness-and-effectiveness-of-informative-charts-9f0455474bf1))

**Note on point 4 and the bonus SQLite requirement**

I attempted to integrate Bun's built-in SQLite (`bun:sqlite`) to make recent searches durable. It works locally — add `serverExternalPackages: ["bun:sqlite"]` to `next.config.ts` and run `bun --bun next dev/build/start` so the server process actually executes under the real Bun runtime, since Next's server otherwise runs under Node even when started via `bun run` — but it doesn't hold up for this app's deployment target. Vercel's filesystem is read-only outside of `/tmp`, `/tmp` is wiped between invocations and isn't shared across concurrent instances, and Vercel doesn't guarantee that repeat requests hit the same instance. Under those constraints, a local SQLite file can't provide real durability, so I reverted to the in-memory store rather than ship something that looks durable but silently isn't. In a production setting, I'd use a networked SQL database instead, which would also open up better options for insights and metrics.
