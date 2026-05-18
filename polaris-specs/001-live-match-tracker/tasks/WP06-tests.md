---
work_package_id: "WP06"
subtasks:
  - "T032"
  - "T033"
  - "T034"
  - "T035"
  - "T036"
title: "Tests --- unit and component tests for all tracker logic"
phase: "Phase 5 - Quality"
lane: "planned"
assignee: ""
agent: ""
shell_pid: ""
review_status: ""
reviewed_by: ""
domain: "testing-specialist"
dependencies: ["WP05"]
history:
  - timestamp: "2026-05-18T00:00:00Z"
    lane: "planned"
    agent: "system"
    shell_pid: ""
    action: "Prompt generated via /polaris.tasks"
---

# Work Package Prompt: WP06 -- Tests

## Review Feedback

*[Empty --- no feedback yet.]*

---

## Objectives and Success Criteria

1. `npm test` passes with 0 failures.
2. `addEvent` and `undoLastEvent` are covered by unit tests verifying correct field increments/decrements.
3. `saveMatch` payload shape is verified: all squad members present, `played: true`, correct `fixtureId` and `seasonId`.
4. Squad pre-population from existing API stats is tested.
5. "Start Tracking" disabled state is tested.
6. Event sheet shows GK-only buttons for GK; hides them for non-GK.
7. Fixture date filter utility tests pass (already written in WP02/T012, but verify here).

---

## Context and Constraints

- **Test framework**: Vitest + React Testing Library (`@testing-library/react`).
- **Test location**: `frontend/src/pages/live/__tests__/` --- co-located with the feature.
- **Setup**: `frontend/src/setupTests.ts` already imports `@testing-library/jest-dom`. Vitest is configured in `package.json`.
- **Mocking**: Use `vi.fn()` for service mocks. Use `vi.mock('../../../services/...')` to mock API calls.
- **Hook testing**: Use `renderHook` from `@testing-library/react` to test `useLiveTracker`.
- **Auth0 mock**: `@auth0/auth0-react` should be mocked with `vi.mock('@auth0/auth0-react', () => ({ useAuth0: () => ({ getAccessTokenSilently: vi.fn().mockResolvedValue('test-token'), isAuthenticated: true }) }))`.
- **Existing test pattern**: Look at `frontend/src/pages/admin/__tests__/` for examples of the RTL test style used in this codebase.

---

## Subtasks and Detailed Guidance

### T032 -- `use-live-tracker.test.ts`

**Purpose**: Unit-test the hook's core state mutations without rendering any DOM.

**File**: CREATE `frontend/src/pages/live/__tests__/use-live-tracker.test.ts`

**Test cases**:

```typescript
// 1. addEvent increments the correct fields
test('addEvent GOAL_LEFT increments goals and goalsLeft', () => {
  // renderHook + act
  // call addEvent(playerId, 'GOAL_LEFT')
  // assert stats.get(playerId).goals === 1, goalsLeft === 1, goalsRight === 0
});

test('addEvent SHOT_ON increments shots and shotsOnTarget', () => { ... });

test('addEvent ASSIST increments only assists', () => { ... });

test('addEvent SAVE increments only saves', () => { ... });

// 2. undoLastEvent decrements the correct field
test('undoLastEvent reverts most recent event', () => {
  // addEvent twice
  // undoLastEvent once
  // assert only the second event was removed; first event counters intact
});

test('undoLastEvent does nothing when event log is empty', () => {
  // call undoLastEvent on empty log
  // assert no errors thrown; stats unchanged
});

// 3. saveMatch payload shape
test('saveMatch includes all squad members with played: true', async () => {
  // mock PostGameStatsBulk
  // tick 3 players into squad, log 1 event for player 1
  // call saveMatch
  // assert PostGameStatsBulk called with array of 3; all have played: true
  // assert player 1 has goals > 0; players 2 and 3 have all zeros
});

test('saveMatch uses fixture.seasonId in every payload entry', async () => { ... });

// 4. Phase transitions
test('startTracking sets phase to tracking', () => { ... });
test('saveMatch sets phase to done on success', async () => { ... });
test('saveMatch sets phase back to tracking and sets error on failure', async () => { ... });
```

**Mocking setup**: Mock `GetTigersFixture`, `GetPlayers`, `GetFixtureGameStats`, `PostGameStatsBulk` before each test group.

---

### T033 -- `squad-setup.test.tsx`

**Purpose**: Component tests for the squad selection screen.

**File**: CREATE `frontend/src/pages/live/__tests__/squad-setup.test.tsx`

**Test cases**:

```typescript
// 1. Pre-tick from existing stats
test('players with existing played stats are pre-checked', () => {
  // mock GetFixtureGameStats to return [{playerId: 7, played: true, ...}]
  // render SquadSetup
  // assert player 7 checkbox is checked
  // assert player 3 (no stats) checkbox is unchecked
});

// 2. Toggle
test('clicking a player row toggles their checkbox', async () => {
  // render with player unchecked
  // userEvent.click on player row
  // assert checkbox becomes checked
});

// 3. Start button disabled state
test('Start Tracking button is disabled when no players selected', () => {
  // render with empty squadIds
  // assert button has disabled attribute
});

test('Start Tracking button is enabled when at least one player selected', () => {
  // render with one player selected
  // assert button is NOT disabled
});

// 4. Player list sorted by shirt
test('players are sorted by shirt number ascending', () => {
  // provide players with shirts [10, 1, 7]
  // assert rendered order is [1, 7, 10]
});
```

---

### T034 -- `event-sheet.test.tsx`

**Purpose**: Verify GK-conditional event rendering and dismiss behaviour.

**File**: CREATE `frontend/src/pages/live/__tests__/event-sheet.test.tsx`

**Test cases**:

```typescript
// 1. Non-GK player: Save and Penalty Save not rendered
test('non-GK player does not see Save or Penalty Save buttons', () => {
  const player = { id: 1, nickname: 'Bob', shirt: 7, position: 2 }; // MID
  render(<EventSheet open={true} player={player} onEvent={vi.fn()} onClose={vi.fn()} />);
  expect(screen.queryByText('Save')).not.toBeInTheDocument();
  expect(screen.queryByText('Penalty Save')).not.toBeInTheDocument();
});

// 2. GK player: Save and Penalty Save are rendered
test('GK player sees Save and Penalty Save buttons', () => {
  const gk = { id: 5, nickname: 'Dave', shirt: 1, position: 0 }; // GK
  render(<EventSheet open={true} player={gk} onEvent={vi.fn()} onClose={vi.fn()} />);
  expect(screen.getByText('Save')).toBeInTheDocument();
  expect(screen.getByText('Penalty Save')).toBeInTheDocument();
});

// 3. Tapping an event calls onEvent and closes
test('tapping an event calls onEvent with correct type', async () => {
  const onEvent = vi.fn();
  const onClose = vi.fn();
  render(<EventSheet open={true} player={nonGkPlayer} onEvent={onEvent} onClose={onClose} />);
  await userEvent.click(screen.getByText('Goal - Left Foot'));
  expect(onEvent).toHaveBeenCalledWith('GOAL_LEFT');
  expect(onClose).toHaveBeenCalled();
});

// 4. Cancel closes without recording
test('Cancel button calls onClose without calling onEvent', async () => {
  const onEvent = vi.fn();
  const onClose = vi.fn();
  render(<EventSheet open={true} player={nonGkPlayer} onEvent={onEvent} onClose={onClose} />);
  await userEvent.click(screen.getByText('Cancel'));
  expect(onEvent).not.toHaveBeenCalled();
  expect(onClose).toHaveBeenCalled();
});
```

---

### T035 -- `live-fixture-list.test.tsx`

**Purpose**: Test the fixture list page loading, date filtering, and card navigation.

**File**: CREATE `frontend/src/pages/live/__tests__/live-fixture-list.test.tsx` (or extend the existing file from T012 if it was placed here).

**Additional test cases** (beyond T012 which tests the utility function):

```typescript
// 1. Loading state
test('shows loading indicator while fixtures are being fetched', () => {
  // mock GetTigersFixtures to return a pending Promise
  // render LiveFixtureList
  // assert CircularProgress is in the document
});

// 2. Error state
test('shows error message when fixture fetch fails', async () => {
  // mock GetTigersFixtures to reject
  // render and wait
  // assert error alert is shown
});

// 3. Fixture cards render correct content
test('renders fixture card with home team, away team, and formatted date', async () => {
  // mock GetTigersFixtures with a fixture today
  // render and wait for data
  // assert card text contains team names and date
});

// 4. No fixtures fallback
test('shows message when no upcoming or past fixtures exist', async () => {
  vi.mocked(GetTigersFixtures).mockResolvedValue([]);
  render(<LiveFixtureList />);
  await waitFor(() => expect(screen.getByText(/no upcoming fixtures/i)).toBeInTheDocument());
});
```

---

### T036 -- Run test suite

**Purpose**: Confirm all tests pass with zero failures before marking WP06 done.

**Steps**:

```bash
cd frontend
npm test
```

Expected output: all test files pass. If any test fails, fix it before marking done.

Coverage report:
```bash
npm run test:coverage
```

Target: 80%+ line coverage across the new `frontend/src/pages/live/` files.

---

## Test Strategy

- All tests use `vi.mock` to isolate API calls.
- No real network calls in any test.
- Auth0 is mocked globally in test setup.
- `renderHook` used for hook logic tests (no DOM needed for pure state logic).

---

## Risks and Mitigations

- **MUI Drawer in tests**: MUI Drawer uses portals; ensure tests use `within(document.body)` or check `screen` queries against the body. Add `<BrowserRouter>` wrapper if navigation is tested.
- **`crypto.randomUUID` in test environment**: jsdom may not support it. If tests fail with `crypto.randomUUID is not a function`, add a polyfill in `setupTests.ts`: `globalThis.crypto.randomUUID = () => Math.random().toString(36).slice(2)`.

---

## Review Guidance

- `npm test` output shows 0 failures.
- Test names follow `test_` prefix convention per constitution (or `test('...')` as used in the existing codebase --- match the codebase convention).
- Each test file covers at least 2 scenarios per component/function.

---

## Activity Log

- 2026-05-18T00:00:00Z -- system -- lane=planned -- Prompt created.
