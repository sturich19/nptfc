# Work Packages: Live Match Tracker

**Feature**: 001-live-match-tracker
**Inputs**: `polaris-specs/001-live-match-tracker/`
**Prerequisites**: spec.md, plan.md, control-map.md, contracts/api-contracts.md

---

## Work Package WP01: Foundation (Priority: P0)

**Goal**: Establish the TypeScript types, hook skeleton, placeholder pages, and route registration so all downstream WPs have a compilable base to build on.
**Independent Test**: `npm run build:only` succeeds; `/live` and `/live/:fixtureId` render placeholder text.
**Prompt**: `polaris-specs/001-live-match-tracker/tasks/WP01-foundation.md`

### Included Subtasks
- [ ] T001 Create `frontend/src/pages/live/types.ts` (LiveEvent, PlayerLiveStats, EventType, TrackerPhase, EVENT_FIELD_MAP)
- [ ] T002 Create `frontend/src/pages/live/hooks/use-live-tracker.ts` skeleton (all function stubs, no logic)
- [ ] T003 [P] Create placeholder `frontend/src/pages/live/live-fixture-list.tsx`
- [ ] T004 [P] Create placeholder `frontend/src/pages/live/live-tracker.tsx`
- [ ] T005 Modify `frontend/src/routes/routes.tsx` to add `/live` and `/live/:fixtureId` routes
- [ ] T006 Run `npm run build:only` and confirm TypeScript compiles cleanly

### Parallel Opportunities
- T003 and T004 can be written simultaneously (different files, no shared imports).

### Dependencies
- None --- starting package.

### Risks
- Route naming clash with existing routes: verify no `/live` prefix conflicts in routes.tsx.

---

## Work Package WP02: Fixture List Page (Priority: P1) MVP

**Goal**: Implement the `/live` landing screen showing today's and upcoming fixtures so admins can tap into the tracker.
**Independent Test**: `/live` renders fixture cards; date filter correctly shows today to +28 days; fallback shows 3 recent past fixtures when window is empty.
**Prompt**: `polaris-specs/001-live-match-tracker/tasks/WP02-fixture-list.md`

### Included Subtasks
- [ ] T007 Implement `filterUpcomingFixtures` utility (today to +28 days, fallback to 3 past)
- [ ] T008 Implement `live-fixture-list.tsx` with `GetTigersFixtures()` fetch and filter
- [ ] T009 Render fixture cards (MUI Card) showing date, home team, away team, game type
- [ ] T010 Add loading skeleton and error state to fixture list
- [ ] T011 [P] Add "Live Tracker" entry card to `frontend/src/pages/admin.tsx`
- [ ] T012 Write unit test for `filterUpcomingFixtures` utility

### Parallel Opportunities
- T011 (admin card) is independent of T007-T010 and can proceed concurrently.

### Dependencies
- WP01 (route + placeholder in place).

### Risks
- `TigersFixture.date` is a `DateTime` from the API; ensure client-side comparison uses local date not UTC midnight.

---

## Work Package WP03: Squad Setup (Priority: P1) MVP

**Goal**: Implement the squad selection phase of `/live/:fixtureId` --- data loading, player list with checkboxes, pre-tick from prior session, and "Start Tracking" gate.
**Independent Test**: Squad picker renders all active players sorted by shirt; pre-ticks players with existing `played: true` stats; Start Tracking button disabled until at least one player is selected.
**Prompt**: `polaris-specs/001-live-match-tracker/tasks/WP03-squad-setup.md`

### Included Subtasks
- [ ] T013 Flesh out `live-tracker.tsx` as a phase-switcher shell (renders `<SquadSetup>` or `<TrackerBoard>` based on phase)
- [ ] T014 Implement data loading in `useLiveTracker` (parallel fetch: fixture + players + existing stats; initialise `squadIds` Set and `stats` Map from existing stats)
- [ ] T015 Implement `squad-setup.tsx` player list sorted by shirt number with MUI Checkbox rows
- [ ] T016 Pre-tick logic: players whose `playerId` appears in existing stats with `played === true` are pre-selected
- [ ] T017 Implement `toggleSquadMember` in hook; enable "Start Tracking" button only when `squadIds.size > 0`
- [ ] T018 Wire `startTracking()` call from squad-setup button to phase transition `setup -> tracking`

### Parallel Opportunities
- T014 (hook data loading) and T015 (squad-setup UI shell) can be written in parallel once T013 is done.

### Dependencies
- WP01 (types and hook skeleton).

### Risks
- If fixture fetch returns `seasonId: 0` or null, the save payload will be invalid. Guard against this and show an error state.

---

## Work Package WP04: Tracker Board, Event Sheet, and Undo (Priority: P1) MVP

**Goal**: Implement the live tracking phase --- player card grid, tap-to-log event sheet, event log with one-level undo, and the End Match confirmation dialog.
**Independent Test**: Tapping a player card opens the event sheet; tapping an event increments the correct counter; Undo reverts only the most recent event; End Match dialog appears on button tap.
**Prompt**: `polaris-specs/001-live-match-tracker/tasks/WP04-tracker-board.md`

### Included Subtasks
- [ ] T019 Create `frontend/src/pages/live/live-tracker.css` with mobile grid, 48px+ tap targets, pinned End Match button styles
- [ ] T020 Implement `player-card.tsx` (shirt badge, nickname, stat summary chips, GK badge if position is GK)
- [ ] T021 Implement `event-sheet.tsx` (MUI Drawer anchor=bottom; event buttons 64px+ height; GK-only rows conditional on position)
- [ ] T022 Implement `event-log.tsx` (reverse-chronological log; Undo button active only on index 0; dimmed on older entries)
- [ ] T023 Implement `tracker-board.tsx` (2-column player grid; sheet open/close state; event log panel; End Match button + MUI Dialog)
- [ ] T024 Implement `addEvent` and `undoLastEvent` logic in `use-live-tracker.ts` using EVENT_FIELD_MAP
- [ ] T025 Wire tracker-board to hook: player card onClick -> open sheet; event tap -> addEvent; undo tap -> undoLastEvent; End Match confirm -> saveMatch

### Parallel Opportunities
- T019 (CSS) can proceed alongside T020-T022 (components). T020, T021, T022 can be written in parallel (different files).

### Dependencies
- WP03 (squad setup complete; `useLiveTracker` data loading in place).

### Risks
- MUI Drawer on iOS Safari may have scroll-lock issues. Use `disableScrollLock` prop if needed.
- Pinned "End Match" button may overlap last player card on short screens. Add `padding-bottom: 80px` to the player grid container.

---

## Work Package WP05: Save, Error Handling, and GSO Cleanup (Priority: P1) MVP

**Goal**: Complete the save flow (payload assembly, bulk API call, success/retry screens) and remove the unused `gso` field from all frontend views.
**Independent Test**: Saving after a tracked match persists correct stats via the bulk endpoint; retry works after a simulated failure; `gso` no longer appears in any rendered stat table.
**Prompt**: `polaris-specs/001-live-match-tracker/tasks/WP05-save-and-cleanup.md`

### Included Subtasks
- [ ] T026 Implement `saveMatch()` in `use-live-tracker.ts` (assemble `GameStatDTO[]` from `squadIds` + `stats` Map; attach `fixtureId`, `seasonId`, `played: true`; call `PostGameStatsBulk` with Auth0 bearer token)
- [ ] T027 Create `save-outcome.tsx` success screen ("Match saved!" heading + link back to `/live`)
- [ ] T028 Wire save outcome into `live-tracker.tsx`: `phase === 'done'` renders `<SaveOutcome>`; `phase === 'saving'` shows spinner overlay on tracker-board
- [ ] T029 Implement save error state in `tracker-board.tsx`: inline error banner + Retry button that calls `saveMatch()` again; preserve event log and counters on error
- [ ] T030 Remove `gso` from `frontend/src/objects/game-stat.tsx`; grep `frontend/src` for all `gso`/`GSO` references and remove column headers, table cells, and display values
- [ ] T031 Run `npm run build:only` to confirm zero TypeScript errors after all WP05 changes

### Parallel Opportunities
- T030 (GSO cleanup) is entirely independent of T026-T029 and can proceed in parallel.

### Dependencies
- WP04 (tracker board and hook event logic complete).

### Risks
- `getAccessTokenSilently` can throw if the session expired mid-match. Catch and show an auth error prompting re-login.
- GSO may appear in compiled/generated files or CSS class names; grep confirms only `.tsx`/`.ts` files need editing.

---

## Work Package WP06: Tests (Priority: P2)

**Goal**: Cover the tracker's core logic and UI with unit and component tests to satisfy the 80% gate.
**Independent Test**: `npm test` passes with 0 failures.
**Prompt**: `polaris-specs/001-live-match-tracker/tasks/WP06-tests.md`

### Included Subtasks
- [ ] T032 [P] Write `frontend/src/pages/live/__tests__/use-live-tracker.test.ts` (addEvent increments correct fields; undoLastEvent decrements; saveMatch payload includes all squad members with `played: true`)
- [ ] T033 [P] Write `frontend/src/pages/live/__tests__/squad-setup.test.tsx` (pre-tick from existing stats; toggle works; Start Tracking disabled with 0 selected)
- [ ] T034 [P] Write `frontend/src/pages/live/__tests__/event-sheet.test.tsx` (non-GK: no Save/PenSave buttons; GK: Save + PenSave visible; tap outside records nothing)
- [ ] T035 [P] Write `frontend/src/pages/live/__tests__/live-fixture-list.test.tsx` (date filter; fallback to 3 past fixtures; loading state; error state)
- [ ] T036 Run `npm test` and confirm all tests pass; fix any failures before marking done

### Parallel Opportunities
- T032, T033, T034, T035 are fully independent and can be written simultaneously.

### Dependencies
- WP05 (all implementation complete).

---

## Dependency and Execution Summary

```
WP01
  |
  +-- WP02 (parallel with WP03)
  +-- WP03
        |
        WP04
          |
          WP05
            |
            WP06
```

**Parallelization**: WP02 and WP03 can run simultaneously after WP01 merges.
**MVP Scope**: WP01 through WP05 constitute the minimum releasable feature.
**WP06** adds test coverage but is not blocking for a manual QA release.

---

## Subtask Index

| ID   | Summary | WP | Domain | Parallel? |
|------|---------|----|--------|-----------|
| T001 | Create types.ts | WP01 | frontend-craft | No |
| T002 | Hook skeleton | WP01 | frontend-craft | No |
| T003 | Placeholder live-fixture-list | WP01 | frontend-craft | Yes |
| T004 | Placeholder live-tracker | WP01 | frontend-craft | Yes |
| T005 | Register routes | WP01 | frontend-craft | No |
| T006 | Build check | WP01 | frontend-craft | No |
| T007 | filterUpcomingFixtures utility | WP02 | frontend-craft | No |
| T008 | live-fixture-list implementation | WP02 | frontend-craft | No |
| T009 | Fixture cards UI | WP02 | frontend-craft | No |
| T010 | Loading + error states | WP02 | frontend-craft | No |
| T011 | Admin Live Tracker card | WP02 | frontend-craft | Yes |
| T012 | Unit test filterUpcomingFixtures | WP02 | testing-specialist | No |
| T013 | live-tracker phase-switcher shell | WP03 | frontend-craft | No |
| T014 | Hook data loading | WP03 | frontend-craft | Yes |
| T015 | Squad-setup player list UI | WP03 | frontend-craft | Yes |
| T016 | Pre-tick from existing stats | WP03 | frontend-craft | No |
| T017 | toggleSquadMember + button gate | WP03 | frontend-craft | No |
| T018 | Wire startTracking | WP03 | frontend-craft | No |
| T019 | live-tracker.css mobile styles | WP04 | frontend-craft | Yes |
| T020 | player-card.tsx | WP04 | frontend-craft | Yes |
| T021 | event-sheet.tsx | WP04 | frontend-craft | Yes |
| T022 | event-log.tsx | WP04 | frontend-craft | Yes |
| T023 | tracker-board.tsx | WP04 | frontend-craft | No |
| T024 | addEvent + undoLastEvent logic | WP04 | frontend-craft | No |
| T025 | Wire tracker-board to hook | WP04 | frontend-craft | No |
| T026 | saveMatch() implementation | WP05 | frontend-craft | No |
| T027 | save-outcome.tsx | WP05 | frontend-craft | Yes |
| T028 | Phase=done/saving wiring | WP05 | frontend-craft | No |
| T029 | Error state + Retry | WP05 | frontend-craft | No |
| T030 | GSO removal (interface + views) | WP05 | frontend-craft | Yes |
| T031 | Final build check | WP05 | frontend-craft | No |
| T032 | use-live-tracker.test.ts | WP06 | testing-specialist | Yes |
| T033 | squad-setup.test.tsx | WP06 | testing-specialist | Yes |
| T034 | event-sheet.test.tsx | WP06 | testing-specialist | Yes |
| T035 | live-fixture-list.test.tsx | WP06 | testing-specialist | Yes |
| T036 | Run test suite | WP06 | testing-specialist | No |
