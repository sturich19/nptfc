---
work_package_id: "WP04"
subtasks:
  - "T019"
  - "T020"
  - "T021"
  - "T022"
  - "T023"
  - "T024"
  - "T025"
title: "Tracker Board --- player card grid, event sheet, event log, undo, End Match dialog"
phase: "Phase 3 - Core Tracking"
lane: "planned"
assignee: ""
agent: ""
shell_pid: ""
review_status: ""
reviewed_by: ""
domain: "frontend-craft"
dependencies: ["WP03"]
history:
  - timestamp: "2026-05-18T00:00:00Z"
    lane: "planned"
    agent: "system"
    shell_pid: ""
    action: "Prompt generated via /polaris.tasks"
---

# Work Package Prompt: WP04 -- Tracker Board, Event Sheet, and Undo

## Review Feedback

*[Empty --- no feedback yet.]*

---

## Objectives and Success Criteria

1. Squad members appear as a 2-column grid of tappable player cards.
2. Each card shows shirt number, nickname, live stat chips (goals, assists, shots on target; saves for GK).
3. Tapping a card opens a bottom-sheet event selector.
4. Event buttons are at least 64px tall; GK-only events (Save, Penalty Save) appear only for GK players.
5. Tapping an event closes the sheet, increments the correct stat counter on the card, and appends to the event log.
6. The event log shows entries newest-first; only the top entry has an active Undo button.
7. Tapping Undo removes the most recent event and decrements the relevant counter.
8. "End Match" button is pinned to the bottom of the screen; tapping it shows a confirmation dialog.

---

## Context and Constraints

- **Spec**: FR3.1 -- FR3.10, NFR1 (48px+ tap targets).
- **Plan**: Component design section --- `useLiveTracker` interface, EVENT_FIELD_MAP, mobile CSS approach.
- **Types**: `EventType`, `EVENT_FIELD_MAP`, `EVENT_LABELS`, `GK_ONLY_EVENTS` from `frontend/src/pages/live/types.ts`.
- **MUI**: Use `Drawer` with `anchor="bottom"` for the event sheet. Use `Dialog` for the End Match confirmation.
- **Player position 0 = GK**: Check via `player.position === 0`.
- **Do not call saveMatch in this WP** --- the save flow is wired in WP05. The "End Match" confirm button should call a no-op or `console.log` placeholder until WP05 provides `saveMatch`.
- **`live-tracker.tsx`**: Must be updated to render `<TrackerBoard tracker={tracker} />` when `phase === 'tracking'`.

---

## Subtasks and Detailed Guidance

### T019 -- Create `frontend/src/pages/live/live-tracker.css`

**Purpose**: Mobile-first styles for the tracker. Keep styles minimal and targeted; rely on MUI for component-level styling.

**Steps**:

```css
/* live-tracker.css */

.lt-page {
  max-width: 100vw;
  overflow-x: hidden;
  padding: 8px 8px 80px; /* bottom padding clears pinned End Match button */
}

.lt-player-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.lt-player-card {
  min-height: 80px;
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.lt-event-btn {
  min-height: 64px;
  font-size: 1rem;
  width: 100%;
  margin-bottom: 8px;
}

.lt-end-match-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  padding: 8px 16px;
  background: white;
  border-top: 1px solid #e0e0e0;
}

.lt-event-log {
  max-height: 160px;
  overflow-y: auto;
  margin-bottom: 8px;
}
```

**Files**: CREATE `frontend/src/pages/live/live-tracker.css`

---

### T020 -- Implement `player-card.tsx`

**Purpose**: A tappable tile showing shirt number badge, nickname, live stat summary, and GK badge.

**Steps**:

Create `frontend/src/pages/live/components/player-card.tsx`.

```tsx
interface PlayerCardProps {
  player: Player;
  stats: PlayerLiveStats | undefined;
  onClick: () => void;
}
```

Render:
- MUI `Card` with `CardActionArea` wrapping the whole card.
- Apply `className="lt-player-card"` from `live-tracker.css`.
- Shirt number badge: MUI `Avatar` (small, teal background) with `#{shirt}`.
- Nickname in `Typography variant="body1" fontWeight="bold"`.
- GK badge: small MUI `Chip label="GK" size="small"` if `player.position === 0`.
- Stat chips row: show non-zero stats only to keep the card clean.
  - `{stats?.goals ?? 0}G` if goals > 0
  - `{stats?.assists ?? 0}A` if assists > 0
  - `{stats?.shotsOnTarget ?? 0}SOT` if shotsOnTarget > 0
  - `{stats?.saves ?? 0}Sv` if saves > 0 and player is GK

**Files**: CREATE `frontend/src/pages/live/components/player-card.tsx`

---

### T021 -- Implement `event-sheet.tsx`

**Purpose**: MUI Drawer (bottom) showing large tap-target event buttons. GK-only events hidden for non-GK players.

**Steps**:

Create `frontend/src/pages/live/components/event-sheet.tsx`.

```tsx
interface EventSheetProps {
  open: boolean;
  player: Player | null;
  onEvent: (type: EventType) => void;
  onClose: () => void;
}
```

Implementation:
- Use `<Drawer anchor="bottom" open={open} onClose={onClose}>`.
- Inside, render a `Box` with `p={2}`.
- Heading: player nickname + "--- select event".
- Event buttons: map over all `EventType` values. Skip `GK_ONLY_EVENTS` if `player.position !== 0`.
- Each button: MUI `Button variant="outlined" fullWidth className="lt-event-btn"` with `onClick={() => { onEvent(type); onClose(); }}`.
- Label: use `EVENT_LABELS[type]`.
- Arrange in a 2-column grid using MUI `Grid container spacing={1}`.
- Cancel button at the bottom: `Button variant="text" fullWidth onClick={onClose}`.

**Files**: CREATE `frontend/src/pages/live/components/event-sheet.tsx`

---

### T022 -- Implement `event-log.tsx`

**Purpose**: Scrollable log of recent events. Only the topmost (most recent) entry has an active Undo button.

**Steps**:

Create `frontend/src/pages/live/components/event-log.tsx`.

```tsx
interface EventLogProps {
  events: LiveEvent[];
  onUndo: () => void;
}
```

Implementation:
- Container: `<div className="lt-event-log">`.
- If `events.length === 0`: show a muted "No events yet" text.
- Map `events` in reverse order (index 0 = most recent at top).
- Each entry: MUI `ListItem` with `ListItemText` (primary: `playerName --- EVENT_LABELS[eventType]`, secondary: time since event using `date-fns` `formatDistanceToNow`).
- Undo button: only on `events[events.length - 1]` (the most recent). Render as small MUI `IconButton` or `Button size="small"`. Disabled + greyed out on all other entries.

**Files**: CREATE `frontend/src/pages/live/components/event-log.tsx`

---

### T023 -- Implement `tracker-board.tsx`

**Purpose**: Orchestrates the tracking phase: player grid, event sheet, event log, and End Match button. Owns the `selectedPlayerId` local state that controls which player's event sheet is open.

**Steps**:

Create `frontend/src/pages/live/components/tracker-board.tsx`.

```tsx
interface TrackerBoardProps {
  tracker: UseLiveTrackerResult;
}
```

Local state:
```typescript
const [activePlayerId, setActivePlayerId] = useState<number | null>(null);
const [confirmOpen, setConfirmOpen] = useState(false);
```

Layout (wrapped in `<div className="lt-page">`):
1. Fixture header: home vs away + date (from `tracker.fixture`).
2. "Edit Squad" link/button that calls a back-nav to setup (for WP03 FR2.7 --- navigate back to the squad picker using `useNavigate` or by calling a phase-reset function).
3. Event log: `<EventLog events={tracker.eventLog} onUndo={tracker.undoLastEvent} />`.
4. Player grid: `<div className="lt-player-grid">` mapping `tracker.players.filter(p => tracker.squadIds.has(p.id))`.
   - Each `<PlayerCard player={p} stats={tracker.stats.get(p.id)} onClick={() => setActivePlayerId(p.id)} />`.
5. Event sheet: `<EventSheet open={activePlayerId !== null} player={players.find(p => p.id === activePlayerId) ?? null} onEvent={(type) => tracker.addEvent(activePlayerId!, type)} onClose={() => setActivePlayerId(null)} />`.
6. Pinned bar: `<div className="lt-end-match-bar"><Button variant="contained" color="error" fullWidth onClick={() => setConfirmOpen(true)}>End Match</Button></div>`.
7. MUI `<Dialog open={confirmOpen}>` with "Save stats for this match?" and Confirm / Cancel buttons.
   - Confirm: `tracker.saveMatch()` (no-op in this WP; wired in WP05).
   - Cancel: `setConfirmOpen(false)`.

**Files**: CREATE `frontend/src/pages/live/components/tracker-board.tsx`

---

### T024 -- Implement `addEvent` and `undoLastEvent` in `use-live-tracker.ts`

**Purpose**: The core state mutations that power the tracker.

**Steps**:

Replace stubs in `use-live-tracker.ts`:

```typescript
const addEvent = (playerId: number, type: EventType) => {
  const player = players.find(p => p.id === playerId);
  const event: LiveEvent = {
    id: crypto.randomUUID(),
    playerId,
    playerName: player?.nickname ?? `#${playerId}`,
    eventType: type,
    timestamp: Date.now(),
  };
  setEventLog(prev => [...prev, event]);

  const deltas = EVENT_FIELD_MAP[type];
  setStats(prev => {
    const next = new Map(prev);
    const current = next.get(playerId) ?? {
      playerId, goals: 0, goalsLeft: 0, goalsRight: 0, goalsOther: 0,
      assists: 0, shots: 0, shotsOnTarget: 0, shotsOffTarget: 0,
      saves: 0, penSaves: 0, played: true,
    };
    const updated = { ...current };
    (Object.keys(deltas) as (keyof PlayerLiveStats)[]).forEach(key => {
      if (typeof updated[key] === 'number') {
        (updated as any)[key] = (updated[key] as number) + (deltas[key] as number);
      }
    });
    next.set(playerId, updated);
    return next;
  });
};

const undoLastEvent = () => {
  setEventLog(prev => {
    if (prev.length === 0) return prev;
    const last = prev[prev.length - 1];
    const deltas = EVENT_FIELD_MAP[last.eventType];
    setStats(statsMap => {
      const next = new Map(statsMap);
      const current = next.get(last.playerId);
      if (!current) return next;
      const updated = { ...current };
      (Object.keys(deltas) as (keyof PlayerLiveStats)[]).forEach(key => {
        if (typeof updated[key] === 'number') {
          (updated as any)[key] = Math.max(0, (updated[key] as number) - (deltas[key] as number));
        }
      });
      next.set(last.playerId, updated);
      return next;
    });
    return prev.slice(0, -1);
  });
};
```

Note: `crypto.randomUUID()` is available in modern browsers (Chrome 92+, Firefox 95+, Safari 15.4+). For older browser support, use a simple `Date.now() + Math.random()` string instead.

**Files**: MODIFY `frontend/src/pages/live/hooks/use-live-tracker.ts`

---

### T025 -- Wire tracker-board into `live-tracker.tsx` and add "Edit Squad" back-nav

**Purpose**: Replace the WP03 placeholder for the tracking phase with the real TrackerBoard component.

**Steps**:

1. In `live-tracker.tsx`, import `TrackerBoard` and replace the tracking-phase placeholder:
```tsx
import TrackerBoard from './components/tracker-board';

// in the render:
if (tracker.phase === 'tracking') return <TrackerBoard tracker={tracker} />;
```

2. For "Edit Squad" (FR2.7): add a `backToSetup` function to the hook:
```typescript
const backToSetup = () => setPhase('setup');
```
Wire it to a button in `tracker-board.tsx` that navigates back to the setup phase.

**Files**: MODIFY `live-tracker.tsx`, MODIFY `use-live-tracker.ts`, MODIFY `tracker-board.tsx`

---

## Test Strategy

- No automated tests in this WP (tests are in WP06).
- Manual E2E walkthrough:
  1. Select a fixture and tick 3 players including 1 GK.
  2. Tap the GK --- verify Save and Penalty Save buttons appear.
  3. Tap a non-GK --- verify Save and Penalty Save do NOT appear.
  4. Log: Goal Left, Goal Right, Assist for player A; Shot On Target for player B.
  5. Verify player card counters update correctly.
  6. Undo the last event --- counter reverts; event log entry disappears.
  7. Tap End Match --- dialog appears.
  8. Cancel --- dialog closes, tracker intact.

---

## Risks and Mitigations

- **MUI Drawer scroll-lock on iOS**: Add `disableScrollLock` prop to `<Drawer>` if the page scrolls unexpectedly on iPhone Safari.
- **Pinned bar overlap**: If the last player card is hidden behind the bar on short screens, verify `padding-bottom: 80px` on `.lt-page` is applied.
- **`crypto.randomUUID` compatibility**: NPTFC targets modern mobile browsers; `crypto.randomUUID` is safe. Document the assumption in code if used.

---

## Review Guidance

- GK-conditional events work correctly.
- Undo only active on the most recent event log entry.
- Event counters on player cards update immediately after tapping an event.
- End Match dialog appears and dismisses correctly.

---

## Activity Log

- 2026-05-18T00:00:00Z -- system -- lane=planned -- Prompt created.
