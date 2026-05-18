---
work_package_id: "WP05"
subtasks:
  - "T026"
  - "T027"
  - "T028"
  - "T029"
  - "T030"
  - "T031"
title: "Save, Error Handling, and GSO Cleanup --- end-match save flow and field removal"
phase: "Phase 4 - Save and Polish"
lane: "planned"
assignee: ""
agent: ""
shell_pid: ""
review_status: ""
reviewed_by: ""
domain: "frontend-craft"
dependencies: ["WP04"]
history:
  - timestamp: "2026-05-18T00:00:00Z"
    lane: "planned"
    agent: "system"
    shell_pid: ""
    action: "Prompt generated via /polaris.tasks"
---

# Work Package Prompt: WP05 -- Save, Error Handling, and GSO Cleanup

## Review Feedback

*[Empty --- no feedback yet.]*

---

## Objectives and Success Criteria

1. Confirming "End Match" assembles the correct `GameStatDTO[]` payload and posts to `POST /api/GameStats/bulk`.
2. Every squad member receives `played: true` even if they have no recorded events.
3. On a 200 response, a success screen is shown with a link back to `/live`.
4. On an API error, an inline error banner with a Retry button appears; all event data is preserved.
5. A loading/spinner overlay prevents double-submission during the save.
6. The `gso` field is removed from `frontend/src/objects/game-stat.tsx` and from all stat display components.
7. `npm run build:only` passes cleanly after all changes.

---

## Context and Constraints

- **Spec**: FR4.1 -- FR4.7, FR5.1 -- FR5.3.
- **API contract**: `POST /api/GameStats/bulk` accepts `GameStatDTO[]`. See `contracts/api-contracts.md`.
  - Required fields: `playerId`, `fixtureId`, `seasonId`, `played`, all stat counters.
  - `gso: 0` must still be sent in the payload (backend expects it; we just never increment it).
- **Auth0 token**: Use `useAuth0().getAccessTokenSilently()` to get a bearer token. The existing admin pages likely use a similar pattern --- search `frontend/src` for `getAccessTokenSilently` to see the existing pattern before writing new code.
- **`PostGameStatsBulk`**: Already in `frontend/src/services/game-stat-service.tsx`. Uses axios. Pass the Auth0 token by setting `Authorization: Bearer <token>` in the request. Check if there is a global axios interceptor in the codebase that already attaches the token; if so, no per-call token needed.
- **GSO cleanup**: The backend `GSO` column stays; only the frontend display and interface field change.

---

## Subtasks and Detailed Guidance

### T026 -- Implement `saveMatch()` in `use-live-tracker.ts`

**Purpose**: Assemble the full stat payload and post it to the bulk endpoint.

**Steps**:

Replace the `saveMatch` stub:

```typescript
const saveMatch = async () => {
  if (!fixture) {
    setError('No fixture loaded');
    return;
  }
  setPhase('saving');
  setError(null);

  // Assemble payload: one entry per squad member
  const payload: GameStat[] = Array.from(squadIds).map(playerId => {
    const s = stats.get(playerId) ?? {
      playerId, goals: 0, goalsLeft: 0, goalsRight: 0, goalsOther: 0,
      assists: 0, shots: 0, shotsOnTarget: 0, shotsOffTarget: 0,
      saves: 0, penSaves: 0, played: true,
    };
    return {
      id: 0,
      apps: 1,
      playerId,
      fixtureId: fixture.id,
      seasonId: fixture.seasonId,
      played: true,
      goals: s.goals,
      goalsLeft: s.goalsLeft,
      goalsRight: s.goalsRight,
      goalsOther: s.goalsOther,
      assists: s.assists,
      shots: s.shots,
      shotsOnTarget: s.shotsOnTarget,
      shotsOffTarget: s.shotsOffTarget,
      saves: s.saves,
      penSaves: s.penSaves,
      cleanSheets: 0,
      shotsLeft: 0,
      shotsRight: 0,
      gso: 0,
      playerName: '',
    };
  });

  try {
    await PostGameStatsBulk(payload);
    setPhase('done');
  } catch (err) {
    setError('Failed to save match. Tap Retry to try again.');
    setPhase('tracking');
  }
};
```

**Important**: Check whether the existing `PostGameStatsBulk` in `game-stat-service.tsx` already attaches the Auth0 token via a global axios interceptor. If not, retrieve the token with `getAccessTokenSilently` and pass it in the request headers. Search the codebase for `getAccessTokenSilently` usage before adding it.

**Files**: MODIFY `frontend/src/pages/live/hooks/use-live-tracker.ts`

---

### T027 -- Create `save-outcome.tsx` success screen

**Purpose**: Full-screen success state shown after a successful save.

**Steps**:

Create `frontend/src/pages/live/components/save-outcome.tsx`:

```tsx
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface SaveOutcomeProps {
  fixture: TigersFixture | null;
}

const SaveOutcome = ({ fixture }: SaveOutcomeProps) => {
  const navigate = useNavigate();
  return (
    <Box display="flex" flexDirection="column" alignItems="center"
         justifyContent="center" minHeight="60vh" gap={2} p={3}>
      <CheckCircleIcon sx={{ fontSize: 72, color: 'success.main' }} />
      <Typography variant="h5" fontWeight="bold">Match saved!</Typography>
      {fixture && (
        <Typography variant="body1" color="text.secondary">
          {fixture.homeTeam} vs {fixture.awayTeam}
        </Typography>
      )}
      <Button variant="contained" fullWidth sx={{ mt: 2 }}
              onClick={() => navigate('/live')}>
        Back to Fixtures
      </Button>
    </Box>
  );
};

export default SaveOutcome;
```

**Files**: CREATE `frontend/src/pages/live/components/save-outcome.tsx`

---

### T028 -- Wire save outcome and saving spinner into `live-tracker.tsx`

**Purpose**: The `live-tracker.tsx` phase-switcher must handle `phase === 'done'` and `phase === 'saving'`.

**Steps**:

In `live-tracker.tsx`, add these phase branches:

```tsx
import SaveOutcome from './components/save-outcome';
import CircularProgress from '@mui/material/CircularProgress';

// In the render, BEFORE the tracking branch:
if (tracker.phase === 'done') return <SaveOutcome fixture={tracker.fixture} />;

// Saving overlay --- render TrackerBoard underneath with a disabled overlay
if (tracker.phase === 'saving') {
  return (
    <Box position="relative">
      <TrackerBoard tracker={tracker} />
      <Box position="fixed" inset={0} bgcolor="rgba(0,0,0,0.4)"
           display="flex" alignItems="center" justifyContent="center" zIndex={200}>
        <CircularProgress sx={{ color: 'white' }} />
      </Box>
    </Box>
  );
}
```

**Files**: MODIFY `frontend/src/pages/live/live-tracker.tsx`

---

### T029 -- Implement save error state and Retry in `tracker-board.tsx`

**Purpose**: When `tracker.error` is set (save failed), show an inline error banner with a Retry button above the player grid.

**Steps**:

In `tracker-board.tsx`, add below the event log:

```tsx
{tracker.error && (
  <Alert severity="error" sx={{ mb: 1 }}
         action={
           <Button color="inherit" size="small" onClick={tracker.saveMatch}>
             Retry
           </Button>
         }>
    {tracker.error}
  </Alert>
)}
```

The End Match button in the confirmation dialog should also be disabled while `tracker.phase === 'saving'`.

**Files**: MODIFY `frontend/src/pages/live/components/tracker-board.tsx`

---

### T030 -- Remove `gso` from the frontend interface and all display locations

**Purpose**: The user confirmed `gso` will never be used. Remove it from the TypeScript interface and every place it is rendered.

**Steps**:

1. Run a grep to find all references:
   ```
   grep -r "gso\|GSO" frontend/src --include="*.tsx" --include="*.ts"
   ```

2. In `frontend/src/objects/game-stat.tsx`: remove the `gso` field from the `GameStat` interface.

3. For every other file returned by grep:
   - Remove table column headers like `<TableCell>GSO</TableCell>`.
   - Remove table cell data like `<TableCell>{row.gso}</TableCell>`.
   - Remove any prop/field access like `stat.gso` or `gameStat.gso` used in display-only contexts.
   - Do NOT remove `gso: 0` from the `saveMatch` payload in WP05 (the backend still expects it; we send a zero silently).

4. Typical files to check (confirm with grep output):
   - Any admin game stats page or component under `frontend/src/pages/admin/`
   - Any season view or player stats display under `frontend/src/pages/`
   - Any stats table component under `frontend/src/components/`

**Files**: MODIFY `frontend/src/objects/game-stat.tsx` + any files found by grep.

---

### T031 -- Run final build check

**Purpose**: Confirm zero TypeScript errors after all WP05 changes.

**Steps**:
```bash
cd frontend
npm run build:only
```

Fix any TypeScript errors before marking this WP done. Common issues:
- Property `gso` used on `GameStat` interface after removal → fix the offending file.
- Missing imports in new components.

---

## Test Strategy

- No automated save-flow tests in this WP (WP06 covers them).
- Manual E2E:
  1. Complete a full match (select fixture → tick squad → log events → End Match → Confirm).
  2. Verify the success screen appears.
  3. Go to the admin game stats page and confirm the stats were persisted correctly.
  4. Simulate a save failure (disconnect network or mock a 500 response in browser DevTools); verify the error banner and Retry button appear.
  5. Search rendered UI for "GSO" --- should find zero instances.

---

## Risks and Mitigations

- **axios auth interceptor**: If there is no global interceptor for the Auth0 token and the service calls fail with 401, you must add `getAccessTokenSilently()` to the hook and pass the token. This is the most likely integration issue.
- **`fixture.seasonId` is 0**: Guard at the top of `saveMatch()` --- if `seasonId` is 0 or undefined, set an error state and do not POST.
- **GSO in compiled/minified output**: The TypeScript build check will catch any remaining references.

---

## Review Guidance

- `saveMatch` builds the correct payload shape (verify in browser Network tab).
- Success screen renders after successful save.
- Error + Retry flow works (test with DevTools network throttling).
- Zero GSO references in rendered UI (browser search-in-page).

---

## Activity Log

- 2026-05-18T00:00:00Z -- system -- lane=planned -- Prompt created.
