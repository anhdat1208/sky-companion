# Task 10 Report: `useMoonCalendar` composable

## Status: ✅ Complete

## What was done
- Created `tests/composables/useMoonCalendar.test.ts` (4 cases from brief)
- Verified RED: missing module import failure
- Implemented `app/composables/useMoonCalendar.ts` mirroring `useTelescope` (`resolveWhenSource`, `refreshToken`, try/catch, watch)
- Used `flush: 'sync'` on coordinates watch so null coords clear derived state synchronously (required by test)
- Fixed local date `new Date(2026, 7, 3, 12, 0, 0)` for month nav / selectDay; padding `2026-07-27` ignored via `inCurrentMonth`

## Tests
```
npx vitest run tests/composables/useMoonCalendar.test.ts
→ 4 passed
```

## Commit
`f1c2fc5` — `feat(moon): add useMoonCalendar composable`

## Follow-up fix: clear day detail on month navigation
- **Issue:** `goToPrevMonth` / `goToNextMonth` cleared `selectedDateISO` but left `selectedDetail` until `recompute()` finished. If `recompute` threw early, detail from the previous month could linger.
- **Fix:** Set `selectedDetail.value = null` alongside `selectedDateISO` in both nav functions (same pattern as `clearSelectedDay`).
- **Test:** Added case — `selectDay` then `goToNextMonth` clears `selectedDetail`.

### Re-test
```
npx vitest run tests/composables/useMoonCalendar.test.ts
→ 5 passed
```
