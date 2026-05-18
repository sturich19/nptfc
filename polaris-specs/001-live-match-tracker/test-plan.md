# Test Plan: Live Match Tracker

**Feature**: 001-live-match-tracker
**Created**: 2026-05-18

---

## Unit Tests

### filterUpcomingFixtures utility (WP02/T012)

| Test | Location | WP |
|------|----------|----|
| test_upcoming_fixtures_within_28_days | live-fixture-list.test.tsx | WP02 |
| test_fixtures_outside_window_excluded | live-fixture-list.test.tsx | WP02 |
| test_fallback_to_3_recent_past_fixtures | live-fixture-list.test.tsx | WP02 |
| test_empty_fixture_list_returns_empty | live-fixture-list.test.tsx | WP02 |
| test_todays_fixture_is_included | live-fixture-list.test.tsx | WP02 |

### useLiveTracker hook (WP06/T032)

| Test | Location | WP |
|------|----------|----|
| test_addEvent_GOAL_LEFT_increments_goals_and_goalsLeft | use-live-tracker.test.ts | WP06 |
| test_addEvent_SHOT_ON_increments_shots_and_shotsOnTarget | use-live-tracker.test.ts | WP06 |
| test_addEvent_ASSIST_increments_only_assists | use-live-tracker.test.ts | WP06 |
| test_addEvent_SAVE_increments_only_saves | use-live-tracker.test.ts | WP06 |
| test_undoLastEvent_reverts_most_recent_event | use-live-tracker.test.ts | WP06 |
| test_undoLastEvent_does_nothing_on_empty_log | use-live-tracker.test.ts | WP06 |
| test_saveMatch_includes_all_squad_members_with_played_true | use-live-tracker.test.ts | WP06 |
| test_saveMatch_uses_fixture_seasonId | use-live-tracker.test.ts | WP06 |
| test_startTracking_sets_phase_to_tracking | use-live-tracker.test.ts | WP06 |
| test_saveMatch_sets_phase_to_done_on_success | use-live-tracker.test.ts | WP06 |
| test_saveMatch_sets_phase_to_tracking_and_error_on_failure | use-live-tracker.test.ts | WP06 |

---

## Component / Integration Tests

### SquadSetup (WP06/T033)

| Test | Location | WP |
|------|----------|----|
| test_players_with_played_stats_are_pre_checked | squad-setup.test.tsx | WP06 |
| test_clicking_player_toggles_checkbox | squad-setup.test.tsx | WP06 |
| test_start_tracking_disabled_with_zero_selected | squad-setup.test.tsx | WP06 |
| test_start_tracking_enabled_with_one_selected | squad-setup.test.tsx | WP06 |
| test_players_sorted_by_shirt_number | squad-setup.test.tsx | WP06 |

### EventSheet (WP06/T034)

| Test | Location | WP |
|------|----------|----|
| test_non_gk_does_not_see_save_or_pen_save | event-sheet.test.tsx | WP06 |
| test_gk_sees_save_and_pen_save_buttons | event-sheet.test.tsx | WP06 |
| test_tapping_event_calls_onEvent_with_correct_type | event-sheet.test.tsx | WP06 |
| test_cancel_button_closes_without_recording | event-sheet.test.tsx | WP06 |

### LiveFixtureList (WP06/T035)

| Test | Location | WP |
|------|----------|----|
| test_shows_loading_indicator_during_fetch | live-fixture-list.test.tsx | WP06 |
| test_shows_error_when_fetch_fails | live-fixture-list.test.tsx | WP06 |
| test_renders_fixture_card_with_teams_and_date | live-fixture-list.test.tsx | WP06 |
| test_shows_no_upcoming_fixtures_message_when_empty | live-fixture-list.test.tsx | WP06 |

---

## Acceptance Tests (Manual)

| ID | Scenario | Steps | Expected |
|----|----------|-------|----------|
| AC1 | Full match flow | Log in as admin -> /live -> select fixture -> tick 11 players -> log 5 events -> End Match -> Confirm | Success screen shown; stats in DB |
| AC2 | GK event filtering | Tick squad with GK; tap GK card | Save and Penalty Save buttons visible |
| AC3 | Undo | Log Goal Left for player A; tap Undo | Goal counter reverts to 0; event removed from log |
| AC4 | Resume session | Save mid-match stats; reload page | Squad and stat counters pre-populated from API |
| AC5 | Network failure on save | Tap End Match with network off | Error banner + Retry shown; data preserved |
| AC6 | GSO absent | Navigate any stat table | "GSO" does not appear anywhere in the UI |

---

## Edge Cases

| Case | How to test |
|------|-------------|
| Fixture has no upcoming matches (window empty) | API returns only past fixtures; verify fallback shows 3 most recent |
| Player with shirt = null | Verify sorting handles null shirts gracefully (sort to end) |
| Zero squad members selected | Verify Start Tracking button remains disabled |
| Undo on empty event log | Verify no crash or console error |
| Save with seasonId = 0 | Verify error state is shown rather than posting invalid payload |
| Auth token expired mid-match | Verify auth error is surfaced with a useful message |

---

## Coverage Gate

Target: 80% line coverage across `frontend/src/pages/live/` after WP06.

Run: `npm run test:coverage`
