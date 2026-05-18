---
work_package_id: "WP01"
subtasks:
  - "T001"
  - "T002"
  - "T003"
  - "T004"
  - "T005"
  - "T006"
title: "Foundation --- types, hook skeleton, placeholder pages, route registration"
phase: "Phase 1 - Foundation"
lane: "planned"
assignee: ""
agent: ""
shell_pid: ""
review_status: ""
reviewed_by: ""
domain: "frontend-craft"
dependencies: []
history:
  - timestamp: "2026-05-18T00:00:00Z"
    lane: "planned"
    agent: "system"
    shell_pid: ""
    action: "Prompt generated via /polaris.tasks"
---

# Work Package Prompt: WP01 -- Foundation

## Review Feedback

*[Empty --- no feedback yet.]*

---

## Objectives and Success Criteria

1. All TypeScript types for the live tracker exist in `frontend/src/pages/live/types.ts`.
2. The `useLiveTracker` hook skeleton exists with every function stubbed out (no logic yet).
3. Placeholder pages exist at `live-fixture-list.tsx` and `live-tracker.tsx`.
4. Routes `/live` and `/live/:fixtureId` are registered in `routes.tsx`.
5. `npm run build:only` passes with zero TypeScript errors.

---

## Context and Constraints

- **Spec**: `polaris-specs/001-live-match-tracker/spec.md` --- data model section (LiveEvent, PlayerLiveStats).
- **Plan**: `polaris-specs/001-live-match-tracker/plan.md` --- component design section.
- **Frontend conventions**: Pages in `frontend/src/pages/`; interfaces in `frontend/src/objects/`; hooks in co-located `hooks/` subdirectory.
- **Routes file**: `frontend/src/routes/routes.tsx` --- routes registered under `<Route path="/" element={<Layout/>}>`.
- This WP creates scaffolding only. No logic, no API calls, no rendering of real data.

---

## Subtasks and Detailed Guidance

### T001 -- Create `frontend/src/pages/live/types.ts`

**Purpose**: Define the shared TypeScript types that every live tracker component depends on. Must be written first so the hook skeleton (T002) can import from it.

**Steps**:

Create `frontend/src/pages/live/types.ts` with the following content:

```typescript
export type TrackerPhase = 'setup' | 'tracking' | 'saving' | 'done';

export type EventType =
  | 'GOAL_LEFT'
  | 'GOAL_RIGHT'
  | 'GOAL_OTHER'
  | 'SHOT_ON'
  | 'SHOT_OFF'
  | 'ASSIST'
  | 'SAVE'
  | 'PEN_SAVE';

export interface LiveEvent {
  id: string;
  playerId: number;
  playerName: string;
  eventType: EventType;
  timestamp: number;
}

export interface PlayerLiveStats {
  playerId: number;
  goals: number;
  goalsLeft: number;
  goalsRight: number;
  goalsOther: number;
  assists: number;
  shots: number;
  shotsOnTarget: number;
  shotsOffTarget: number;
  saves: number;
  penSaves: number;
  played: boolean;
}

export const EVENT_FIELD_MAP: Record<EventType, Partial<PlayerLiveStats>> = {
  GOAL_LEFT:  { goals: 1, goalsLeft: 1 },
  GOAL_RIGHT: { goals: 1, goalsRight: 1 },
  GOAL_OTHER: { goals: 1, goalsOther: 1 },
  SHOT_ON:    { shots: 1, shotsOnTarget: 1 },
  SHOT_OFF:   { shots: 1, shotsOffTarget: 1 },
  ASSIST:     { assists: 1 },
  SAVE:       { saves: 1 },
  PEN_SAVE:   { penSaves: 1 },
};

export const EVENT_LABELS: Record<EventType, string> = {
  GOAL_LEFT:  'Goal - Left Foot',
  GOAL_RIGHT: 'Goal - Right Foot',
  GOAL_OTHER: 'Goal - Header/Other',
  SHOT_ON:    'Shot on Target',
  SHOT_OFF:   'Shot off Target',
  ASSIST:     'Assist',
  SAVE:       'Save',
  PEN_SAVE:   'Penalty Save',
};

export const GK_ONLY_EVENTS: EventType[] = ['SAVE', 'PEN_SAVE'];
```

**Files**: CREATE `frontend/src/pages/live/types.ts`

---

### T002 -- Create `frontend/src/pages/live/hooks/use-live-tracker.ts` skeleton

**Purpose**: Define the hook's full interface as stubs so TypeScript can type-check imports in downstream WPs. No implementation logic yet.

**Steps**:

Create `frontend/src/pages/live/hooks/use-live-tracker.ts`:

```typescript
import { useState } from 'react';
import { TrackerPhase, LiveEvent, PlayerLiveStats, EventType } from '../types';
import { TigersFixture } from '../../../objects/tigers-fixture';
import { Player } from '../../../objects/player';

export interface UseLiveTrackerResult {
  phase: TrackerPhase;
  fixture: TigersFixture | null;
  players: Player[];
  squadIds: Set<number>;
  stats: Map<number, PlayerLiveStats>;
  eventLog: LiveEvent[];
  isLoading: boolean;
  error: string | null;
  toggleSquadMember: (playerId: number) => void;
  startTracking: () => void;
  addEvent: (playerId: number, type: EventType) => void;
  undoLastEvent: () => void;
  saveMatch: () => Promise<void>;
}

export function useLiveTracker(fixtureId: number): UseLiveTrackerResult {
  const [phase, setPhase] = useState<TrackerPhase>('setup');
  const [fixture, setFixture] = useState<TigersFixture | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [squadIds, setSquadIds] = useState<Set<number>>(new Set());
  const [stats, setStats] = useState<Map<number, PlayerLiveStats>>(new Map());
  const [eventLog, setEventLog] = useState<LiveEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleSquadMember = (_playerId: number) => {};
  const startTracking = () => {};
  const addEvent = (_playerId: number, _type: EventType) => {};
  const undoLastEvent = () => {};
  const saveMatch = async () => {};

  return {
    phase, fixture, players, squadIds, stats, eventLog,
    isLoading, error,
    toggleSquadMember, startTracking, addEvent, undoLastEvent, saveMatch,
  };
}
```

**Files**: CREATE `frontend/src/pages/live/hooks/use-live-tracker.ts`

---

### T003 -- Create placeholder `frontend/src/pages/live/live-fixture-list.tsx`

**Purpose**: Placeholder so routes.tsx can import it without error. Will be fully implemented in WP02.

**Steps**:

```tsx
const LiveFixtureList = () => {
  return <div>Live Fixture List - coming soon</div>;
};
export default LiveFixtureList;
```

**Files**: CREATE `frontend/src/pages/live/live-fixture-list.tsx`

---

### T004 -- Create placeholder `frontend/src/pages/live/live-tracker.tsx`

**Purpose**: Placeholder for the tracker page. Fully implemented in WP03.

**Steps**:

```tsx
const LiveTracker = () => {
  return <div>Live Tracker - coming soon</div>;
};
export default LiveTracker;
```

**Files**: CREATE `frontend/src/pages/live/live-tracker.tsx`

---

### T005 -- Register routes in `frontend/src/routes/routes.tsx`

**Purpose**: Make `/live` and `/live/:fixtureId` navigable so QA can verify each WP as it ships.

**Steps**:

1. Add imports at the top of `routes.tsx`:
   ```tsx
   import LiveFixtureList from '../pages/live/live-fixture-list';
   import LiveTracker from '../pages/live/live-tracker';
   ```

2. Add routes inside `<Route path="/" element={<Layout/>}>`, before the catch-all `*`:
   ```tsx
   <Route path="/live" element={<LiveFixtureList />} />
   <Route path="/live/:fixtureId" element={<LiveTracker />} />
   ```

**Files**: MODIFY `frontend/src/routes/routes.tsx`

---

### T006 -- Run build check

**Purpose**: Confirm zero TypeScript errors before downstream WPs begin.

**Steps**:
```bash
cd frontend
npm run build:only
```

Expect clean output. If TypeScript errors appear, fix them before marking WP01 done.

---

## Test Strategy

No dedicated tests for WP01 (scaffolding only). The build check (T006) is the gate.
WP02 adds the first unit test (T012).

---

## Risks and Mitigations

- **Import path errors**: `TigersFixture` and `Player` types must exist at the referenced paths. Verify `frontend/src/objects/tigers-fixture.tsx` and `frontend/src/objects/player.tsx` exist before writing the hook.
- **Route conflict**: No existing route starts with `/live`. Confirmed safe.

---

## Review Guidance

- `types.ts` exports match the plan's data model section exactly.
- Hook interface matches `UseLiveTrackerResult` signature in plan.md.
- Routes registered and `npm run build:only` passes cleanly.

---

## Activity Log

- 2026-05-18T00:00:00Z -- system -- lane=planned -- Prompt created.
