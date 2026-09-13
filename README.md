# Skyline Weather

A full-stack weather dashboard built for the Ard Group Software Engineer technical assessment. Search for a city to see current conditions and a five-day forecast.

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

## Improvements with more time

1. Add a shared durable cache and recent-search store for multi-instance deployments.
2. Add end-to-end browser coverage for the search flow and responsive layouts.
3. Add dark mode and optional browser geolocation after the core path remains stable.
4. Add request observability, rate limiting, and a more complete location selector for duplicate city names.
