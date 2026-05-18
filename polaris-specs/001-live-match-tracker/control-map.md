# Control Map: Live Match Tracker

## Flows

| Flow | Route | Entry | Exit |
|------|-------|-------|------|
| F1 - Fixture list | `/live` | Direct nav / sidebar link | Tap fixture -> F2 |
| F2 - Squad setup | `/live/:fixtureId` (setup phase) | F1 or direct URL | "Start Tracking" -> F3; Back -> F1 |
| F3 - Live tracker | `/live/:fixtureId` (tracking phase) | F2 | "End Match" + confirm -> F4; "Edit Squad" -> F2 |
| F4 - Save outcome | Inline on F3 | Bulk POST completes | Success: back to fixtures; Error: retry stays on F3 |

## Phase State Machine (within `/live/:fixtureId`)

```
[setup]  --start-tracking-->  [tracking]  --end-match-confirmed-->  [saving]
   ^                               |                                     |
   |---edit-squad------------------+             success: /fixtures      |
                                                 error: back to [tracking]
```

## Shared Dependencies

| Dependency | Used by | Notes |
|-----------|---------|-------|
| `GET /api/tigersfixtures` | F1 | Filter to upcoming window client-side |
| `GET /api/tigersfixtures/:id` | F2 | Fixture detail + seasonId |
| `GET /api/players` | F2 | All active players for squad picker |
| `GET /api/GameStats/fixture/:id` | F2 | Pre-populate squad + counters on resume |
| `POST /api/GameStats/bulk` | F4 | Save all player stats at end of match |
| Auth0 `useAuth0` hook | F1, F2, F3, F4 | Token for API calls; admin role check on save |
| `PlayerLiveStats` accumulator | F3, F4 | Central state; source of truth for counters and save payload |
| `LiveEvent[]` log | F3 | Undo source; display-only after save |
