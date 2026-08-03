# API Reference

Base URL: same origin as the Nuxt app (for example `http://localhost:3000` in development).

All astronomy endpoints share the same query shape. Coordinates are required; observation time is optional.

## Shared query parameters

| Name | Type | Required | Constraints |
| --- | --- | --- | --- |
| `lat` | number (or numeric string) | Yes | `-90` … `90` |
| `lng` | number (or numeric string) | Yes | `-180` … `180` |
| `time` | ISO-8601 datetime string | No | Zod `z.iso.datetime()`; defaults to server current time |

Example:

```http
GET /api/sky?lat=10.7769&lng=106.7009&time=2026-07-30T08:00:00.000Z
```

## Errors

Validation failures return **400**. Unexpected calculation failures return **500**.

Body shape (`ApiError` in `types/api.ts`):

```json
{
  "statusCode": 400,
  "message": "Invalid coordinates or time parameter."
}
```

Exact wrapping may follow Nitro/`createError` conventions; `statusCode` and `message` are the stable fields to rely on.

---

## `GET /api/sky`

Full sky snapshot for the given location and time. Preferred endpoint for the home page.

**Response:** `SkySnapshot`

```json
{
  "timestamp": "2026-07-30T08:00:00.000Z",
  "moon": {
    "altitude": 42.1,
    "azimuth": 215.3,
    "riseTime": "2026-07-30T12:10:00.000Z",
    "setTime": "2026-07-30T23:45:00.000Z",
    "illuminatedPercentage": 68.4,
    "phase": "Waxing Gibbous"
  },
  "sun": {
    "altitude": -18.2,
    "azimuth": 55.0,
    "sunrise": "2026-07-30T23:05:00.000Z",
    "sunset": "2026-07-30T11:20:00.000Z"
  },
  "planets": [
    {
      "name": "Jupiter",
      "altitude": 31.2,
      "azimuth": 140.5,
      "isVisible": true
    }
  ],
  "constellation": {
    "name": "Scorpius"
  },
  "milkyWayVisibility": "Good",
  "directionToLook": "South-East"
}
```

`milkyWayVisibility`: `Excellent` | `Good` | `Poor` | `Not Visible`

`directionToLook`: cardinal / intercardinal labels (`North`, `North-East`, … `North-West`)

Altitude and azimuth are degrees. Rise/set and sun event fields may be `null` when not available for that day/context.

---

## `GET /api/moon`

Moon-only metrics. Same query params as `/api/sky`.

**Response:** `MoonInfo` (same shape as `SkySnapshot.moon`)

---

## `GET /api/planets`

Planet list with visibility flags. Same query params as `/api/sky`.

**Response:** `PlanetInfo[]`

```json
[
  {
    "name": "Venus",
    "altitude": 12.4,
    "azimuth": 280.1,
    "isVisible": true
  }
]
```

---

## `GET /api/iss`

TLE-backed ISS snapshot (SGP4). Coordinates are optional; when both `lat` and `lng` are present, the response includes the next visible pass and current brightness for that observer.

### Query parameters

| Name | Type | Required | Constraints |
| --- | --- | --- | --- |
| `lat` | number (or numeric string) | No* | `-90` … `90` |
| `lng` | number (or numeric string) | No* | `-180` … `180` |

\* Provide both together, or neither. One without the other returns **400**.

Examples:

```http
GET /api/iss
GET /api/iss?lat=10.7769&lng=106.7009
```

**Response:** `IssSnapshot`

```json
{
  "position": {
    "timestamp": "2026-07-30T08:00:00.000Z",
    "latitude": -12.3456,
    "longitude": 102.1234,
    "altitudeKm": 418.2,
    "velocityKph": 27640.5
  },
  "groundTrack": [
    {
      "latitude": -10.1,
      "longitude": 100.2,
      "timestamp": "2026-07-30T07:45:00.000Z"
    }
  ],
  "nextPass": {
    "riseTime": "2026-07-30T12:10:00.000Z",
    "maxTime": "2026-07-30T12:14:00.000Z",
    "setTime": "2026-07-30T12:18:00.000Z",
    "durationSeconds": 480,
    "maxElevationDeg": 42.5,
    "direction": "South-West → North-East",
    "magnitude": -2.1
  },
  "brightness": {
    "magnitude": 1.2,
    "label": "Dim"
  },
  "tleEpoch": "25215.12345678",
  "source": "live-tle"
}
```

Without coordinates: `nextPass` and `brightness` are `null`; `position` and `groundTrack` are still populated.

`brightness.label`: `Bright` | `Moderate` | `Dim` | `Not Visible`

`source`: `live-tle` | `cached-tle` | `fallback-tle`

Legacy alias: `ISSPass` in `types/api.ts` is deprecated and equals `IssPosition` (`IssSnapshot.position`). Prefer `IssSnapshot` / `IssPosition` from `types/iss.ts`.

---

## Types

Shared contracts live in:

- `types/astronomy.ts` — `SkySnapshot`, `MoonInfo`, `SunInfo`, `PlanetInfo`, …
- `types/iss.ts` — `IssSnapshot`, `IssPosition`, `IssPassPrediction`, `IssBrightness`, …
- `types/api.ts` — `ApiError`, deprecated `ISSPass`
- `types/location.ts` — `Coordinates`
- `utils/validation.ts` — Zod `skyQuerySchema`, `issQuerySchema`
