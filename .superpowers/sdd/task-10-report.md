# Task 10 Report: Snapshot assembler

## Status
**Complete** — TDD green, committed.

## Deliverables
| File | Action |
|------|--------|
| `lib/photo/snapshot.ts` | Created — `buildAstroPhotographySnapshot` |
| `lib/photo/index.ts` | Export `buildAstroPhotographySnapshot` |
| `tests/lib/photo/snapshot.test.ts` | Created — Hanoi smoke assertions |

## Implementation
1. `getNightWindow` → if null, return null sections + `suggestedSettings: getCameraSettings('milky-way')` + timestamp.
2. Else: golden / blue / twilight, MW (`astronomicalDark` = evening.end→morning.start), moon, planets, score, timeline.
3. **Representative instant** for score moon + planets: midpoint of astronomical dark if length > 0; else midpoint sunset→sunrise; else `when`.
4. Score: MW visibility/core + moon at representative + `hasAstronomicalDarkness`.
5. Timeline: moonrise/set, MW peak, planet marker at representative if any planet visible.

## Tests
- RED: missing `lib/photo/snapshot` module
- GREEN: `tests/lib/photo/snapshot.test.ts` — 1 passed
- `tests/lib/photo`: **17/17** passed

## Commit
```
2f479d9 feat(photo): assemble astrophotography snapshot
```

## Concerns / Notes
- Spec text prefers “local midnight” first; brief/plan prefer astronomical-dark midpoint — followed brief.
- `getSunInfo` not needed for current `PhotographyScoreInput` (moon fields only).
- Planet timeline marker uses representative ISO when any planet `isVisible`; end left null.

## Next
Task 11: `useAstroPhotography` composable.
