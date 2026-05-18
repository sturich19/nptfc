---
work_package_id: "WP02"
subtasks:
  - "T007"
  - "T008"
  - "T009"
  - "T010"
  - "T011"
  - "T012"
title: "Fixture List Page --- /live landing screen with upcoming fixtures"
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

# Work Package Prompt: WP02 -- Fixture List Page

## Review Feedback

*[Empty --- no feedback yet.]*

---

## Objectives and Success Criteria

1. `/live` renders a list of fixtures for today through the next 28 days.
2. If no upcoming fixtures exist, the 3 most recent past fixtures are shown as fallback.
3. Each fixture card shows: formatted date, home team name, away team name, and game type.
4. Tapping a card navigates to `/live/:fixtureId`.
5. Loading and error states are handled.
6. "Live Tracker" card appears on the `/admin` page.
7. Unit test for the date-filter utility passes.

---

## Context and Constraints

- **Spec**: FR1.1 -- FR1.5.
- **API**: `GET /api/tigersfixtures` returns `TigersFixtureDTO[]` (see `contracts/api-contracts.md`). Filter and sort client-side.
- **TigersFixtureDTO fields**: `id`, `date` (ISO string from API), `homeTeam` (string), `awayTeam` (string), `type` (GameType enum: 0=League, 1=Cup, 2=Friendly --- verify enum values from `frontend/src/objects/tigers-fixture.tsx`).
- **Existing service**: `GetTigersFixtures()` in `frontend/src/services/tigers-fixture-service.tsx`.
- **Auth**: App.tsx already enforces global Auth0 auth; no extra guard needed for `/live`.
- **Admin page**: `frontend/src/pages/admin.tsx` uses a `adminCards` array pattern --- add a new entry following the same pattern.

---

## Subtasks and Detailed Guidance

### T007 -- Implement `filterUpcomingFixtures` utility

**Purpose**: Pure function to filter and sort fixtures for the landing page. Must be unit-testable in isolation.

**Steps**:

Create a utility function. Best placed in `frontend/src/pages/live/live-fixture-list.tsx` as an exported helper, or in `frontend/src/utils/` if a `live-utils.ts` file feels appropriate. Either location is fine.

```typescript
export function filterUpcomingFixtures(
  fixtures: TigersFixture[],
  today: Date = new Date()
): TigersFixture[] {
  const todayStart = new Date(today);
  todayStart.setHours(0, 0, 0, 0);
  const windowEnd = new Date(todayStart);
  windowEnd.setDate(windowEnd.getDate() + 28);

  const upcoming = fixtures
    .filter(f => {
      const d = new Date(f.date);
      return d >= todayStart && d <= windowEnd;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (upcoming.length > 0) return upcoming;

  // Fallback: 3 most recent past fixtures
  return fixtures
    .filter(f => new Date(f.date) < todayStart)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);
}
```

**Files**: CREATE or MODIFY wherever you place this utility.

---

### T008 -- Implement `live-fixture-list.tsx` with fetch and filter

**Purpose**: Replace the WP01 placeholder with the real component.

**Steps**:

```tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GetTigersFixtures } from '../../services/tigers-fixture-service';
import { TigersFixture } from '../../objects/tigers-fixture';
import { filterUpcomingFixtures } from './live-fixture-list'; // adjust if utility is elsewhere

const LiveFixtureList = () => {
  const [fixtures, setFixtures] = useState<TigersFixture[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    GetTigersFixtures()
      .then(data => {
        setFixtures(filterUpcomingFixtures(data ?? []));
      })
      .catch(() => setError('Failed to load fixtures'))
      .finally(() => setIsLoading(false));
  }, []);

  // render loading / error / fixture list below
};
```

**Files**: MODIFY `frontend/src/pages/live/live-fixture-list.tsx`

---

### T009 -- Render fixture cards

**Purpose**: Display each fixture as a tappable MUI Card following the existing admin card style.

**Steps**:

Each card should show:
- Date formatted as "Sat 18 May" --- use `date-fns` `format(new Date(f.date), 'EEE d MMM')` (already a dependency in `package.json`).
- Home team name vs Away team name in large text.
- Game type label: map the `GameType` enum to "League" / "Cup" / "Friendly".
- Use MUI `Card` + `CardActionArea` with `onClick={() => navigate(`/live/${f.id}`)}`.
- Large tap targets: `CardActionArea` `sx={{ p: 2 }}`.

Game type mapping:
```typescript
const GAME_TYPE_LABELS: Record<number, string> = { 0: 'League', 1: 'Cup', 2: 'Friendly' };
```

Verify the actual GameType enum values from `frontend/src/objects/tigers-fixture.tsx` or backend enums and adjust if different.

**Files**: MODIFY `frontend/src/pages/live/live-fixture-list.tsx`

---

### T010 -- Add loading and error states

**Purpose**: The page must give feedback while the API call is in flight and on failure.

**Steps**:

- Loading: render MUI `CircularProgress` centered on the page.
- Error: render an MUI `Alert severity="error"` with a Retry button that re-triggers the fetch.
- Empty state (no upcoming fixtures and no past fixtures): show "No upcoming fixtures found."

**Files**: MODIFY `frontend/src/pages/live/live-fixture-list.tsx`

---

### T011 -- Add "Live Tracker" card to admin.tsx

**Purpose**: Give admins a quick-access entry point from the existing admin dashboard.

**Steps**:

In `frontend/src/pages/admin.tsx`, add a new entry to the `adminCards` array:

```typescript
{
  title: "Live Match Tracker",
  description: "Log player stats in real time during a match",
  icon: <SportsSoccerIcon />,   // already imported
  color: "#00897b",             // teal
  route: "/live"
}
```

Place it first in the array so it is prominently positioned.

**Files**: MODIFY `frontend/src/pages/admin.tsx`

---

### T012 -- Write unit test for `filterUpcomingFixtures`

**Purpose**: Verify the date-window logic and fallback are correct without a browser.

**Steps**:

Create `frontend/src/pages/live/__tests__/live-fixture-list.test.tsx` (or a separate utils test file if the utility lives in `utils/`).

Test cases:
1. Fixtures within today to +28 days are returned, sorted ascending.
2. Fixtures outside the window (before today, after +28 days) are excluded.
3. When no upcoming fixtures exist, returns up to 3 most recent past fixtures sorted descending.
4. When no fixtures at all, returns [].
5. Today's fixture (date = today midnight) is included.

Use `vi.setSystemTime` / `vi.useFakeTimers` to pin the current date in tests.

**Files**: CREATE `frontend/src/pages/live/__tests__/live-fixture-list.test.tsx`

---

## Test Strategy

- T012 must pass as part of this WP.
- Manual check: navigate to `/live` in the browser; confirm fixture cards render and tapping one navigates to `/live/1` (or whichever ID).

---

## Risks and Mitigations

- **Date parsing**: API returns ISO string dates. `new Date(f.date)` in the browser interprets UTC midnight as local midnight on most platforms, but can shift by timezone on others. Confirm with a real fixture date in the browser before finalising.
- **GameType enum values**: Verify the integer values by reading `frontend/src/objects/tigers-fixture.tsx` before hardcoding the label map.

---

## Review Guidance

- `filterUpcomingFixtures` is exported and unit-tested.
- Cards navigate correctly to `/live/:id`.
- Loading + error states render as expected.
- Admin page shows "Live Match Tracker" card.

---

## Activity Log

- 2026-05-18T00:00:00Z -- system -- lane=planned -- Prompt created.
