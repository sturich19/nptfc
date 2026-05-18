# Plan: Live Match Tracker

**Feature**: 001-live-match-tracker
**Spec**: `polaris-specs/001-live-match-tracker/spec.md`
**Created**: 2026-05-18

---

## Technical Context

### Existing backend endpoints used (no backend changes for tracker)

| Endpoint | Usage |
|----------|-------|
| `GET /api/tigersfixtures` | Fixture list for `/live` landing page |
| `GET /api/tigersfixtures/:id` | Fixture detail + seasonId on tracker load |
| `GET /api/players` | All active players for squad picker |
| `GET /api/GameStats/fixture/:id` | Pre-populate squad from prior session |
| `POST /api/GameStats/bulk` | Save all stats at full time |

### Auth pattern

`App.tsx` enforces global Auth0 authentication (redirects to login if unauthenticated).
The live tracker pages sit inside the existing `Layout` wrapper and inherit this guard.
Admin-role check is applied only at save time using `getAccessTokenSilently` + the
existing Auth0 bearer pattern used elsewhere.

### Frontend conventions (from codebase)

- Pages live in `src/pages/`; complex pages have a subdirectory (e.g. `src/pages/admin/`)
- Services are `*-service.tsx` files in `src/services/`
- TypeScript interfaces in `src/objects/`
- Tests co-located in `__tests__` directories; Vitest + React Testing Library
- MUI components for UI; Bootstrap classes for layout
- Routes registered in `src/routes/routes.tsx` under the `Layout` Route

---

## Constitution Check

| Requirement | This plan |
|-------------|-----------|
| Auth required (FR1.1, NFR2) | Inherited from App.tsx; admin JWT used on save |
| No new backend endpoints (NFR5) | Confirmed - reuses existing 5 endpoints |
| TypeScript strict | No new `any` introduced; explicit interface types |
| Tests must pass before review | WP06 adds tests for hook + key components |
| No hardcoded credentials | Auth token via `getAccessTokenSilently` |
| Confidential data (player names, stats) | Behind Auth0 authentication throughout |

---

## File Plan

### New files

```
frontend/src/pages/live/
  live-fixture-list.tsx          # /live route component
  live-tracker.tsx               # /live/:fixtureId route component
  live-tracker.css               # mobile-first styles for tracker
  components/
    squad-setup.tsx              # Phase 1: player selection
    tracker-board.tsx            # Phase 2: main tracking screen
    player-card.tsx              # tappable player tile with live counters
    event-sheet.tsx              # bottom sheet: event type buttons
    event-log.tsx                # scrollable log with undo
    save-outcome.tsx             # success / error state after save
  hooks/
    use-live-tracker.ts          # state machine: squad, stats, events, phase
  types.ts                       # LiveEvent, PlayerLiveStats, EventType, TrackerPhase
```

### Modified files

```
frontend/src/routes/routes.tsx           # add /live and /live/:fixtureId routes
frontend/src/services/game-stat-service.tsx  # add GetFixtureGameStats (already exists - verify)
frontend/src/objects/game-stat.tsx       # remove gso field
frontend/src/pages/admin.tsx             # add "Live Tracker" card linking to /live
```

### GSO cleanup (locate and edit)

Grep for `gso` and `GSO` across `src/` to find all display references. Expected locations:
- `src/objects/game-stat.tsx` (interface field)
- Any stat table or display component showing "GSO" as a column header or value

---

## Component Design

### `useLiveTracker` hook

Central state manager. Owns all mutable tracker state.

```typescript
interface UseLiveTrackerResult {
  phase: TrackerPhase;                           // 'setup' | 'tracking' | 'saving' | 'done'
  fixture: TigersFixture | null;
  players: Player[];                             // all active players
  squadIds: Set<number>;                         // ticked player IDs
  stats: Map<number, PlayerLiveStats>;           // keyed by playerId
  eventLog: LiveEvent[];
  isLoading: boolean;
  error: string | null;

  toggleSquadMember(playerId: number): void;
  startTracking(): void;                         // setup -> tracking
  addEvent(playerId: number, type: EventType): void;
  undoLastEvent(): void;
  saveMatch(): Promise<void>;                    // tracking -> saving -> done|error
  retrySetPhase(phase: TrackerPhase): void;      // reset to tracking after error
}
```

**`addEvent` logic:**
1. Generate uuid event entry, push to eventLog
2. Look up PlayerLiveStats for playerId; increment the fields mapped to EventType
3. Update stats Map

**`undoLastEvent` logic:**
1. Pop eventLog[eventLog.length - 1]
2. Decrement the corresponding field(s) in stats Map for that player

**`saveMatch` logic:**
1. Set phase = 'saving'
2. Map stats entries to GameStatDTO array (squadIds drives who is included; all get played: true)
3. Call PostGameStatsBulk with Auth0 token
4. On success: phase = 'done'
5. On error: phase = 'tracking'; set error string for display

### Event type -> field mapping (in types.ts)

```typescript
export const EVENT_FIELD_MAP: Record<EventType, Partial<PlayerLiveStats>> = {
  GOAL_LEFT:    { goals: 1, goalsLeft: 1 },
  GOAL_RIGHT:   { goals: 1, goalsRight: 1 },
  GOAL_OTHER:   { goals: 1, goalsOther: 1 },
  SHOT_ON:      { shots: 1, shotsOnTarget: 1 },
  SHOT_OFF:     { shots: 1, shotsOffTarget: 1 },
  ASSIST:       { assists: 1 },
  SAVE:         { saves: 1 },
  PEN_SAVE:     { penSaves: 1 },
};
```

### player-card.tsx

- 48px minimum height; full-width on mobile
- Shows: shirt number badge, nickname, and inline stat chips (e.g. "2G 1A")
- GK badge if position === Position.GK
- `onClick` -> opens event sheet for this player

### event-sheet.tsx

- MUI `Drawer` (anchor="bottom") or custom CSS bottom sheet
- Large buttons (min 64px height) arranged in a 2-column grid
- GK-only buttons (Save, Penalty Save) shown conditionally
- "Cancel" / tap outside closes without recording

### Route registration

```tsx
// In routes.tsx - add inside <Route path="/" element={<Layout/>}>
<Route path="/live" element={<LiveFixtureList />} />
<Route path="/live/:fixtureId" element={<LiveTracker />} />
```

---

## Work Packages

### WP01 - Foundation
**Scope**: Types, hook skeleton, service wiring, route registration

Files:
- CREATE `frontend/src/pages/live/types.ts`
- CREATE `frontend/src/pages/live/hooks/use-live-tracker.ts` (skeleton with all function signatures)
- MODIFY `frontend/src/routes/routes.tsx` (add two routes; import placeholders)
- VERIFY `frontend/src/services/game-stat-service.tsx` has `PostGameStatsBulk` (it does)

Acceptance: TypeScript compiles; new routes render placeholder text.

---

### WP02 - Fixture list page
**Scope**: `/live` landing screen showing upcoming fixtures

Files:
- CREATE `frontend/src/pages/live/live-fixture-list.tsx`
- MODIFY `frontend/src/pages/admin.tsx` (add "Live Tracker" card)

Logic:
- Call `GetTigersFixtures()`, filter to today through +28 days, sort by date ascending
- Fallback: if empty, show last 3 past fixtures
- Each fixture as a tappable MUI Card navigating to `/live/:id`

Acceptance: Fixtures render on `/live`; cards navigate correctly.

---

### WP03 - Squad setup
**Scope**: Phase 1 within `/live/:fixtureId`

Files:
- CREATE `frontend/src/pages/live/live-tracker.tsx` (phase switcher shell)
- CREATE `frontend/src/pages/live/components/squad-setup.tsx`

Logic:
- Load fixture, players, existing stats via hooks
- Render scrollable player list sorted by shirt number
- Checkbox per player; pre-tick if existing GameStat.played === true
- "Start Tracking" button disabled until >= 1 selected
- "Start Tracking" -> `startTracking()` -> phase changes to 'tracking'

Acceptance: Squad picker renders; toggle works; start button enables/disables correctly.

---

### WP04 - Tracker board + event sheet + undo
**Scope**: Phase 2 within `/live/:fixtureId`

Files:
- CREATE `frontend/src/pages/live/components/tracker-board.tsx`
- CREATE `frontend/src/pages/live/components/player-card.tsx`
- CREATE `frontend/src/pages/live/components/event-sheet.tsx`
- CREATE `frontend/src/pages/live/components/event-log.tsx`
- CREATE `frontend/src/pages/live/live-tracker.css`
- IMPLEMENT `frontend/src/pages/live/hooks/use-live-tracker.ts` (addEvent, undoLastEvent)

Logic:
- Player cards grid (2 columns on mobile)
- Tap player -> open event sheet
- Tap event -> addEvent() -> sheet closes -> card counter updates
- Event log panel at top or bottom; only first entry has active Undo button
- Undo -> undoLastEvent()
- "End Match" button pinned to page bottom; opens MUI Dialog for confirmation

Acceptance: Events record and display; undo reverts; counters update.

---

### WP05 - Save + error handling + GSO cleanup
**Scope**: Save flow to completion; GSO removal from frontend

Files:
- CREATE `frontend/src/pages/live/components/save-outcome.tsx`
- IMPLEMENT `saveMatch()` in `use-live-tracker.ts`
- MODIFY `frontend/src/objects/game-stat.tsx` (remove `gso`)
- GREP + MODIFY any component displaying `gso`/`GSO` in stat tables

Save logic:
- Assemble GameStatDTO[] from stats Map
- Include all squadIds with played: true (even zero-stat players)
- Set fixtureId from fixture.id; seasonId from fixture.seasonId
- Post via PostGameStatsBulk with bearer token
- On success: render save-outcome.tsx (success state)
- On error: display inline error + Retry button in tracker-board

Acceptance: Stats reach the API correctly; bulk upsert persists to DB; success screen shows; error allows retry; GSO absent from all frontend views.

---

### WP06 - Tests
**Scope**: Unit + component tests for the tracker

Files:
- CREATE `frontend/src/pages/live/__tests__/use-live-tracker.test.ts`
- CREATE `frontend/src/pages/live/__tests__/squad-setup.test.tsx`
- CREATE `frontend/src/pages/live/__tests__/event-sheet.test.tsx`
- CREATE `frontend/src/pages/live/__tests__/live-fixture-list.test.tsx`

Test coverage targets:
- `addEvent` + `undoLastEvent` logic (unit, no DOM)
- Squad pre-population from existing stats
- "Start Tracking" button disabled state
- Event sheet renders correct buttons for GK vs non-GK
- Fixture date filter function
- Save payload shape (played: true for all squad members)
- GSO absence: grep assertion or render check

---

## Implementation Sequence

```
WP01 (foundation) -> WP02 (fixture list) -> WP03 (squad setup)
                                         -> WP04 (tracker + undo)
                                              -> WP05 (save + cleanup)
                                                   -> WP06 (tests)
```

WP02 and WP03 can run in parallel after WP01. WP04 depends on WP03 (shares phase state). WP05 depends on WP04. WP06 runs after all implementation is complete.

---

## Mobile CSS Approach

- Use `live-tracker.css` for tracker-specific overrides
- Player card grid: `display: grid; grid-template-columns: 1fr 1fr; gap: 8px`
- Player card min tap target: `min-height: 80px; padding: 12px`
- Event sheet buttons: `min-height: 64px; font-size: 1rem; width: 100%`
- Pinned End Match button: `position: fixed; bottom: 0; left: 0; right: 0; z-index: 10`
- No horizontal overflow: `max-width: 100vw; overflow-x: hidden` on root container

---

## Risks

| Risk | Mitigation |
|------|-----------|
| `fixture.seasonId` not available directly on TigersFixtureDTO | **Resolved** - `SeasonId` is present in `TigersFixtureDTO`. No extra fetch needed. |
| Bulk save fails partway through | Backend bulk endpoint is all-or-nothing per EF SaveChanges; entire batch succeeds or fails. Retry is safe (idempotent upsert). |
| GSO field used somewhere not found by grep | Run `grep -r "gso\|GSO" frontend/src` and audit all matches before deleting |
| Auth0 token scope missing for admin | Spec calls out admin role check only at save. Entire app requires auth anyway via App.tsx. |
