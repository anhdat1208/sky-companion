# What's Above Me?

Nuxt 4 web app that shows which celestial objects are above a given location and time — moon, sun, visible planets, constellation context, Milky Way visibility, and a look direction — with a static compass view for azimuth markers.

MVP focus: clean modular architecture, server-side astronomy, typed APIs, and a mobile-first dark UI. No auth, database, or real-time ISS tracking yet.

## Features

- Home page with browser geolocation and manual lat/lng fallback
- Sky snapshot cards: location, time, moon, sun, planets, constellation, Milky Way rating, direction to look
- Compass page with N/S/E/W and markers for the moon and selected planet
- Typed Nitro API routes for sky, moon, planets, and a mocked ISS payload
- Shared TypeScript contracts between UI and server (`types/*`)
- Mapbox token stub via env (no map UI in MVP)

## Tech Stack

| Layer | Choice |
| --- | --- |
| Framework | Nuxt 4 + Vue 3 |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS |
| State | Pinia (`@pinia/nuxt`) |
| Astronomy | `astronomy-engine` (server-side) |
| Validation | Zod |
| Tests | Vitest |
| Map stub | Mapbox GL dependency + `NUXT_PUBLIC_MAPBOX_TOKEN` |

## Local Development

### Prerequisites

- Node.js 20+ (recommended)
- npm

### Setup

```bash
npm install
cp .env.example .env
npm run dev
```

Open the URL printed by Nuxt (typically `http://localhost:3000`).

### Environment

| Variable | Required | Description |
| --- | --- | --- |
| `NUXT_PUBLIC_MAPBOX_TOKEN` | No (MVP) | Public Mapbox token stub for future map UI. Leave empty for local MVP. |

Mapped in `nuxt.config.ts` as `runtimeConfig.public.mapboxToken`.

### Scripts

| Script | Command | Notes |
| --- | --- | --- |
| Dev server | `npm run dev` | Hot reload |
| Production build | `npm run build` | Nitro output in `.output` |
| Static generate | `npm run generate` | SSG build |
| Preview build | `npm run preview` | Serve `.output` |
| Typecheck | `npm run typecheck` | `nuxt typecheck` |
| Tests | `npm run test` | `vitest run` |
| Prepare | `npm run postinstall` | `nuxt prepare` (runs after install) |

**Lint:** there is no `lint` script in this MVP. Use `npm run typecheck` and `npm run test` for quality gates.

## API Routes

| Method | Path | Query | Response |
| --- | --- | --- | --- |
| `GET` | `/api/sky` | `lat`, `lng`, `time?` | `SkySnapshot` |
| `GET` | `/api/moon` | `lat`, `lng`, `time?` | `MoonInfo` |
| `GET` | `/api/planets` | `lat`, `lng`, `time?` | `PlanetInfo[]` |
| `GET` | `/api/iss` | — | mocked `ISSPass` |

- `lat` ∈ [-90, 90], `lng` ∈ [-180, 180]
- `time` optional ISO-8601 datetime; defaults to server “now”
- Invalid input → HTTP 400 with typed `ApiError`
- Unexpected failure → HTTP 500 with a stable message

Full request/response examples: [`docs/api.md`](docs/api.md).

## Architecture

```text
UI (app/pages, components, composables)
  → Nitro API (server/api)
    → Domain (lib/*)
Shared contracts: types/*
Helpers: utils/*
```

Data flow:

1. UI gets coordinates from geolocation or manual form.
2. UI calls `/api/sky` (primary) — compass uses moon/planet azimuths from the same snapshot path.
3. Handlers validate query params, resolve observation time, and delegate to `lib/*`.
4. Typed DTOs render in reusable cards.

Key folders:

- `app/` — pages, components, composables, layout
- `server/api/` — thin Nitro handlers
- `lib/` — astronomy domain modules (framework-agnostic)
- `types/` — shared DTOs
- `utils/` — time + Zod validation
- `tests/` — Vitest coverage for lib, server, composables

Confirmed MVP decisions: astronomy on the server only; static compass (no DeviceOrientation); Mapbox config stub only; ISS endpoint is mocked.

## Roadmap (short)

Out of scope for MVP; intended next steps without rewriting the core:

- Real ISS pass / position provider behind `/api/iss`
- Weather, light pollution, or aurora adapters enriching `SkySnapshot`
- Golden / blue hour extensions in `lib/sun.ts`
- Optional device-orientation compass mode on the client
- PWA / offline cache of the last successful snapshot
- Mapbox-rendered map UI using the existing token stub

## Verification

```bash
npm run typecheck
npm run test
npm run build
```

There is no `npm run lint` script; note that when checking CI or onboarding.
# sky-companion
