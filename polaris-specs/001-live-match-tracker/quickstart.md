# Quickstart: Live Match Tracker

## To run the feature locally

```bash
# Start the backend
cd backend
dotnet run

# Start the frontend (separate terminal)
cd frontend
npm start
```

- Frontend: http://localhost:3000
- Navigate to http://localhost:3000/live after logging in

## To implement

Work through the plan in `polaris-specs/001-live-match-tracker/plan.md`.

Sequence: WP01 -> WP02 + WP03 (parallel) -> WP04 -> WP05 -> WP06

Use `/polaris.implement` with the WP01 prompt file once tasks are generated.

## To test

```bash
cd frontend
npm test
```

GSO cleanup verification:
```bash
grep -r "gso\|GSO" frontend/src
```
Should return zero results after WP05 is complete.

## Key files (new)

```
frontend/src/pages/live/             - all new tracker components
frontend/src/pages/live/types.ts     - LiveEvent, PlayerLiveStats, EventType
frontend/src/pages/live/hooks/use-live-tracker.ts  - state machine
```

## Key files (modified)

```
frontend/src/routes/routes.tsx       - /live and /live/:fixtureId added
frontend/src/objects/game-stat.tsx   - gso field removed
frontend/src/pages/admin.tsx         - Live Tracker card added
```
