---
work_package_id: "WP03"
subtasks:
  - "T013"
  - "T014"
  - "T015"
  - "T016"
  - "T017"
  - "T018"
title: "Squad Setup --- fixture data loading, player selection, pre-tick from prior session"
phase: "Phase 2 - Pages"
lane: "planned"
assignee: ""
agent: ""
shell_pid: ""
review_status: ""
reviewed_by: ""
domain: "frontend-craft"
dependencies: ["WP01"]
history:
  - timestamp: "2026-05-18T00:00:00Z"
    lane: "planned"
    agent: "system"
    shell_pid: ""
    action: "Prompt generated via /polaris.tasks"
---

# Work Package Prompt: WP03 -- Squad Setup

## Review Feedback

*[Empty --- no feedback yet.]*

---

## Objectives and Success Criteria

1. `/live/:fixtureId` loads fixture, all active players, and any existing stats in parallel.
2. All active players appear in a scrollable list sorted by shirt number, each with a checkbox.
3. Players who already have a `played: true` stat for this fixture are pre-ticked on load.
4. Ticking/unticking a player updates the `squadIds` set in `useLiveTracker`.
5. "Start Tracking" button is disabled when zero players are selected.
6. Tapping "Start Tracking" transitions phase from `setup` to `tracking`.
7. The tracker page renders `<SquadSetup>` in setup phase and `<TrackerBoard>` in tracking phase (TrackerBoard is a placeholder at this WP stage).

---

## Context and Constraints

- **Spec**: FR2.1 -- FR2.7.
- **APIs used**:
  - `GET /api/tigersfixtures/:id` → `GetTigersFixture(fixtureId)` in `tigers-fixture-service.tsx`
  - `GET /api/players` → `GetPlayers()` in `player-service.tsx`
  - `GET /api/GameStats/fixture/:id` → `GetFixtureGameStats(fixtureId)` in `game-stat-service.tsx`
- **Player.position** is a number (enum). 0 = GK. Check `frontend/src/objects/player.tsx`.
- **Position labels**: Map `{ 0: 'GK', 1: 'DEF', 2: 'MID', 3: 'ATT' }` or use existing Position enum if present in the codebase.
- **Auth**: `GetFixtureGameStats` requires auth. The global `App.tsx` guard ensures a token is available; pass it via axios interceptor or use `getAccessTokenSilently` if the service needs it.
- **TrackerBoard** doesn't exist yet --- `live-tracker.tsx` should render a placeholder `<div>Tracking phase</div>` when `phase === 'tracking'` until WP04 builds it.

---

## Subtasks and Detailed Guidance

### T013 -- Flesh out `live-tracker.tsx` as a phase-switcher shell

**Purpose**: The route component `live-tracker.tsx` is responsible only for reading the `fixtureId` param, instantiating `useLiveTracker`, and rendering the correct phase component. It owns no UI of its own.

**Steps**:

```tsx
import { useParams } from 'react-router-dom';
import { useLiveTracker } from './hooks/use-live-tracker';
import SquadSetup from './components/squad-setup';

const LiveTracker = () => {
  const { fixtureId } = useParams<{ fixtureId: string }>();
  const tracker = useLiveTracker(Number(fixtureId));

  if (tracker.isLoading) return <div style={{ padding: 16 }}>Loading...</div>;
  if (tracker.error && tracker.phase === 'setup')
    return <div style={{ padding: 16, color: 'red' }}>{tracker.error}</div>;

  if (tracker.phase === 'setup') return <SquadSetup tracker={tracker} />;

  // TrackerBoard will be wired in WP04
  return <div style={{ padding: 16 }}>Tracking phase --- WP04 coming</div>;
};

export default LiveTracker;
```

**Files**: MODIFY `frontend/src/pages/live/live-tracker.tsx`

---

### T014 -- Implement initial data loading in `useLiveTracker`

**Purpose**: Fetch all three data sources in parallel on hook mount and initialise `squadIds` + `stats` from any existing game stats.

**Steps**:

In `use-live-tracker.ts`, replace the skeleton body with a `useEffect` that runs once on mount:

```typescript
useEffect(() => {
  if (!fixtureId) return;
  setIsLoading(true);
  setError(null);

  Promise.all([
    GetTigersFixture(fixtureId),
    GetPlayers(),
    GetFixtureGameStats(fixtureId),
  ])
    .then(([fixtureData, playersData, existingStats]) => {
      setFixture(fixtureData ?? null);
      const activePlayers = (playersData ?? []).filter((p: Player) => p.active !== false);
      setPlayers(activePlayers);

      // Pre-populate from existing stats
      const preSquad = new Set<number>();
      const preStats = new Map<number, PlayerLiveStats>();
      (existingStats ?? []).forEach((gs: GameStat) => {
        if (gs.played) {
          preSquad.add(gs.playerId);
          preStats.set(gs.playerId, {
            playerId: gs.playerId,
            goals: gs.goals ?? 0,
            goalsLeft: gs.goalsLeft ?? 0,
            goalsRight: gs.goalsRight ?? 0,
            goalsOther: gs.goalsOther ?? 0,
            assists: gs.assists ?? 0,
            shots: gs.shots ?? 0,
            shotsOnTarget: gs.shotsOnTarget ?? 0,
            shotsOffTarget: gs.shotsOffTarget ?? 0,
            saves: gs.saves ?? 0,
            penSaves: gs.penSaves ?? 0,
            played: true,
          });
        }
      });
      setSquadIds(preSquad);
      setStats(preStats);
    })
    .catch(err => setError('Failed to load fixture data'))
    .finally(() => setIsLoading(false));
}, [fixtureId]);
```

Import `GetTigersFixture`, `GetPlayers`, `GetFixtureGameStats` from the relevant service files. Import `GameStat` from `frontend/src/objects/game-stat.tsx`.

**Files**: MODIFY `frontend/src/pages/live/hooks/use-live-tracker.ts`

---

### T015 -- Implement `squad-setup.tsx` player list sorted by shirt number

**Purpose**: Render the list of players with MUI checkboxes. Each row shows shirt number, nickname, and position.

**Steps**:

Create `frontend/src/pages/live/components/squad-setup.tsx`.

Props interface:
```typescript
interface SquadSetupProps {
  tracker: UseLiveTrackerResult;
}
```

Player list:
- Sort players by `shirt` number ascending: `[...tracker.players].sort((a, b) => (a.shirt ?? 99) - (b.shirt ?? 99))`.
- Render each as an MUI `ListItem` with a `Checkbox` and `ListItemText` (primary: nickname, secondary: position label + shirt number).
- Use `checked={tracker.squadIds.has(p.id)}`.
- `onChange` calls `tracker.toggleSquadMember(p.id)`.

Position label map:
```typescript
const POSITION_LABELS: Record<number, string> = { 0: 'GK', 1: 'DEF', 2: 'MID', 3: 'ATT' };
```

Header: show fixture info (`tracker.fixture?.homeTeam` vs `tracker.fixture?.awayTeam`, date) using MUI `Typography`.

**Files**: CREATE `frontend/src/pages/live/components/squad-setup.tsx`

---

### T016 -- Pre-tick logic from existing GameStats

**Purpose**: Players who already have a `played: true` stat for this fixture must be checked on load.

**Implementation note**: This is handled in T014 during data load (`preSquad.add(gs.playerId)` when `gs.played === true`). T016 is the verification step:

- Verify that when `GetFixtureGameStats` returns stats with `played: true`, the corresponding player rows render as checked in `squad-setup.tsx`.
- If there are no existing stats, all players start unchecked.
- Write a manual test: run the app, go to a fixture that already has stats, and confirm the players are pre-ticked.

**Files**: No new files. Verification of T014 behaviour.

---

### T017 -- Implement `toggleSquadMember` in hook and "Start Tracking" button gate

**Purpose**: Toggling a player updates `squadIds`; the Start Tracking button is disabled when the set is empty.

**Steps**:

In `use-live-tracker.ts`, replace the `toggleSquadMember` stub:

```typescript
const toggleSquadMember = (playerId: number) => {
  setSquadIds(prev => {
    const next = new Set(prev);
    if (next.has(playerId)) {
      next.delete(playerId);
      // also initialise stats entry if not present (for newly added players)
    } else {
      next.add(playerId);
    }
    return next;
  });
};
```

In `squad-setup.tsx`, the "Start Tracking" button:
```tsx
<Button
  variant="contained"
  fullWidth
  disabled={tracker.squadIds.size === 0}
  onClick={tracker.startTracking}
  sx={{ mt: 2, minHeight: 56 }}
>
  Start Tracking ({tracker.squadIds.size} players)
</Button>
```

**Files**: MODIFY `use-live-tracker.ts`, MODIFY `squad-setup.tsx`

---

### T018 -- Implement `startTracking()` phase transition

**Purpose**: Clicking "Start Tracking" moves phase from `setup` to `tracking` and ensures every squad member has a `PlayerLiveStats` entry in the `stats` Map.

**Steps**:

In `use-live-tracker.ts`, replace the `startTracking` stub:

```typescript
const startTracking = () => {
  setStats(prev => {
    const next = new Map(prev);
    squadIds.forEach(playerId => {
      if (!next.has(playerId)) {
        const player = players.find(p => p.id === playerId);
        next.set(playerId, {
          playerId,
          goals: 0, goalsLeft: 0, goalsRight: 0, goalsOther: 0,
          assists: 0, shots: 0, shotsOnTarget: 0, shotsOffTarget: 0,
          saves: 0, penSaves: 0,
          played: true,
        });
      }
    });
    return next;
  });
  setPhase('tracking');
};
```

**Files**: MODIFY `use-live-tracker.ts`

---

## Test Strategy

- No automated tests in this WP (tests are in WP06).
- Manual verification:
  1. Navigate to `/live/:fixtureId` for a fixture with no existing stats --- all players unchecked.
  2. Navigate to the same URL for a fixture with existing stats --- players with `played: true` are pre-ticked.
  3. Tick one player --- Start Tracking button enables.
  4. Untick all --- Start Tracking button disables.
  5. Click Start Tracking --- page transitions to tracking phase (shows "WP04 coming" placeholder).

---

## Risks and Mitigations

- **`fixture.seasonId` is 0 or undefined**: Guard in `saveMatch()` (WP05). In this WP, log a warning if `fixture?.seasonId` is falsy after load.
- **Parallel fetches**: If `GetPlayers()` or `GetFixtureGameStats()` fails while `GetTigersFixture()` succeeds, handle partial failure gracefully --- show the error state but do not crash.

---

## Review Guidance

- Squad list renders all active players sorted by shirt.
- Pre-tick from existing stats works.
- Button disabled/enabled state correct.
- Phase transitions `setup -> tracking` on Start Tracking.

---

## Activity Log

- 2026-05-18T00:00:00Z -- system -- lane=planned -- Prompt created.
