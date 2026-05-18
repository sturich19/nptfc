# Spec: Live Match Tracker

**Feature**: 001-live-match-tracker
**Status**: Draft
**Created**: 2026-05-18
**Mission**: software-dev

---

## Overview

A mobile-optimised admin tool for logging player statistics in real time during a match.
An authorised admin opens the tracker on their phone, selects today's fixture, ticks the
squad, then taps player and event as the action happens. At full time, one tap saves all
stats to the existing database via the bulk GameStat endpoint.

No new backend endpoints are required for the core tracker. A cleanup task removes the
unused `gso` field from the frontend stat tables.

---

## Actors

| Actor | Description |
|-------|-------------|
| Match Admin | An Auth0-authenticated user with the admin role. The only user who can access the tracker and save stats. |

---

## User Scenarios

### Scenario 1 - Arriving at the fixture list

The match admin navigates to `/live` on their phone. They see a list of fixtures for
today and the next few weeks, showing the home and away team names, the date, and the
competition type. They tap the relevant fixture to open the tracker for that game.

### Scenario 2 - Selecting the squad

The tracker opens on the squad selection screen. All active players are listed. If any
player already has a game stat for this fixture (i.e. a previous session was started),
their row is pre-ticked. The admin ticks each player who is on the pitch today. When
satisfied, they tap "Start Tracking".

### Scenario 3 - Logging an event during the match

The admin taps a player card on the tracker screen. An event sheet rises from the bottom
of the screen showing large tap targets for each event type. The admin taps the event
(e.g. "Goal - Right Foot"). The sheet closes, the player's goal counter increments by
one, and the event appears at the top of the event log panel.

### Scenario 4 - Correcting a mis-tap with undo

The admin taps the Undo button on the most recent event log entry. The event is removed
from the log and the relevant stat counter decrements by one. Undo is available only on
the single most recent event (one-level undo).

### Scenario 5 - Saving at full time

At the end of the match, the admin taps "End Match". A confirmation dialog appears. On
confirm, the tracker assembles one `GameStatDTO` per squad member (every ticked player
gets `played: true` plus their accumulated counters) and posts the array to
`POST /api/GameStats/bulk`. On success, a confirmation screen is shown. On failure, the
error is displayed and the admin can retry.

### Scenario 6 - Resuming an interrupted session

The admin loses their phone signal mid-game and refreshes the page. On reload, the
tracker re-fetches the fixture and any existing game stats from the API and pre-populates
the squad and stat counters from those persisted values. The in-memory event log is lost
(v1 acceptable limitation; documented to the user).

---

## Functional Requirements

### FR1 - Fixture list screen (`/live`)

| ID | Requirement |
|----|-------------|
| FR1.1 | Route `/live` is accessible only to authenticated users (Auth0 required). Non-authenticated users are redirected to the Auth0 login flow. |
| FR1.2 | The screen fetches all Tigers fixtures and displays those whose date falls between today and 28 days from today, sorted ascending by date. If no fixtures exist in that window, show the 3 most recently past fixtures as a fallback. |
| FR1.3 | Each fixture card shows: date (formatted "Sat 18 May"), home team name, away team name, and game type (League / Cup / Friendly). |
| FR1.4 | Tapping a fixture card navigates to `/live/:fixtureId`. |
| FR1.5 | The screen shows a loading state while fetching and an error state if the fetch fails. |

### FR2 - Squad selection screen (`/live/:fixtureId` - Setup phase)

| ID | Requirement |
|----|-------------|
| FR2.1 | On load, the screen fetches: (a) the fixture details via `GET /api/tigersfixtures/:fixtureId`, (b) all active players via `GET /api/players`, (c) existing game stats for the fixture via `GET /api/GameStats/fixture/:fixtureId`. |
| FR2.2 | The fixture header shows home vs away team names and date. |
| FR2.3 | All active players are listed, sorted by shirt number. Each row shows shirt number, nickname, and position label. |
| FR2.4 | Players who already have a GameStat record for this fixture (`played: true`) are pre-ticked. |
| FR2.5 | The admin can toggle any player on or off. At least one player must be selected to proceed. |
| FR2.6 | A "Start Tracking" button navigates to the tracker phase. The button is disabled until at least one player is selected. |
| FR2.7 | The squad selection screen is reachable from the tracker phase (back navigation) to add or remove players mid-match. |

### FR3 - Live tracker screen (`/live/:fixtureId` - Tracking phase)

| ID | Requirement |
|----|-------------|
| FR3.1 | Selected squad members are displayed as tappable player cards in a scrollable grid. |
| FR3.2 | Each player card shows: shirt number, nickname, and live stat summary (goals, assists, shots on target, saves if GK). |
| FR3.3 | Tapping a player card opens an event sheet (bottom sheet / modal). |
| FR3.4 | The event sheet displays large tap target buttons for each event type (see Event Types below). |
| FR3.5 | Tapping an event records it to the in-memory event log, updates the player's running counters, and closes the event sheet. |
| FR3.6 | The event log is displayed as a scrollable list of recent entries, each showing: player nickname, event label, and an Undo button. Only the top-most (most recent) entry has an active Undo button. |
| FR3.7 | Tapping Undo on the most recent event removes it from the log and decrements the relevant stat counter for that player. |
| FR3.8 | An "End Match" button is always visible (pinned to bottom). Tapping it shows a confirmation dialog: "Save stats for this match?". |
| FR3.9 | On confirmation, the tracker posts the stats (see FR4). |
| FR3.10 | Closing the event sheet without selecting an event (tap outside or dismiss) records nothing. |

### Event Types

| Label (UI) | GameStat field incremented |
|------------|---------------------------|
| Goal - Left Foot | `goalsLeft++`, `goals++` |
| Goal - Right Foot | `goalsRight++`, `goals++` |
| Goal - Header/Other | `goalsOther++`, `goals++` |
| Shot on Target | `shotsOnTarget++`, `shots++` |
| Shot off Target | `shotsOffTarget++`, `shots++` |
| Assist | `assists++` |
| Save | `saves++` (shown only if player position is GK) |
| Penalty Save | `penSaves++` (shown only if player position is GK) |

> `shotsLeft` and `shotsRight` are not tracked live in v1. They will be zero on save.
> `cleanSheets` is not tracked as a tap event; it will be computed on the backend from match result and saves (or set to zero and updated by the admin via the existing admin form if needed).
> `gso` is excluded from all v1 tracking (see also FR5).

### FR4 - Save

| ID | Requirement |
|----|-------------|
| FR4.1 | On End Match confirmation, the tracker assembles one `GameStatDTO` per selected squad member. |
| FR4.2 | Every squad member receives `played: true`. Players with no recorded events still appear in the payload (they accumulate the `played` flag only). |
| FR4.3 | `fixtureId` and `seasonId` are taken from the fetched fixture object (`fixture.seasonId`). |
| FR4.4 | The payload is posted to `POST /api/GameStats/bulk` with the Auth0 bearer token in the Authorization header. |
| FR4.5 | On a 200/201 response, show a success screen: "Match saved!" with a link back to the fixtures page. |
| FR4.6 | On any error response, show an inline error with a Retry button. The event log and counters are preserved for retry. |
| FR4.7 | A loading/saving indicator is shown while the request is in flight; the End Match button is disabled during this period. |

### FR5 - GSO field cleanup

| ID | Requirement |
|----|-------------|
| FR5.1 | Remove `gso` from the `GameStat` TypeScript interface (`src/objects/game-stat.tsx`). |
| FR5.2 | Remove any column or display of `gso` / "GSO" from all existing frontend stat tables and views. |
| FR5.3 | Do not remove the `GSO` column from the database or backend model (non-destructive; backend-only change requires a migration which is out of scope for v1). |

---

## Data Model (frontend state)

```typescript
// In-memory event log entry
interface LiveEvent {
  id: string;           // uuid for undo key
  playerId: number;
  playerName: string;
  eventType: EventType;
  timestamp: number;    // Date.now()
}

// Running stat accumulator per player
interface PlayerLiveStats {
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
```

---

## Non-Functional Requirements

| NFR | Requirement |
|-----|-------------|
| NFR1 Mobile | All interactive elements have a minimum tap target of 48x48px. The UI is optimised for 375px viewport width. No horizontal scroll. |
| NFR2 Auth | All routes under `/live` require a valid Auth0 session. The admin role claim is checked before save operations. |
| NFR3 No offline | The tracker requires network connectivity. No service worker or offline caching is introduced in v1. |
| NFR4 No new routes | The feature is a new React route in the existing frontend app. No new deployments or services. |
| NFR5 Backend reuse | The tracker uses only existing backend endpoints. No new controllers, migrations, or models are added for the tracker itself (only the GSO UI cleanup is in scope). |

---

## Assumptions

| # | Assumption |
|---|-----------|
| A1 | `Player.Active` is the correct filter for squad candidates; no team-based filtering is needed in the squad picker. |
| A2 | `GSO` is unused and its meaning is unclear; it is excluded from the live tracker. Backend GSO column is left intact (no migration). |
| A3 | `shotsLeft` and `shotsRight` are not tracked in the live flow; they default to 0 on save. |
| A4 | `cleanSheets` is not a live tap event. It defaults to 0 on save and can be corrected via the existing admin form. |
| A5 | The Auth0 admin role claim is the same claim already used by the existing admin pages. |
| A6 | "Upcoming fixtures" window is today through 28 days ahead. Fallback is the 3 most recent past fixtures if the window is empty. |
| A7 | One-level undo is sufficient for v1. |
| A8 | The in-memory event log is not persisted; a hard refresh loses it. Persisted stats (from a previous save) are recovered via the API. |

---

## Out of Scope (v1)

- Offline / PWA support
- Match clock / minute-stamped events
- Opponent stats (own goals, opposition tracking)
- Real-time sync across multiple devices
- `shotsLeft`, `shotsRight` tracking in the live flow
- `cleanSheets` as a live event
- Backend GSO column removal (requires migration)

---

## Success Criteria

| SC | Criterion |
|----|-----------|
| SC1 | An admin can select a fixture, tick a full squad of 11 players, log a 60-minute match worth of events, and save --- all within 5 minutes on a mobile browser. |
| SC2 | All stat fields saved to the database via `/api/GameStats/bulk` match what the admin would enter manually through the existing admin stat form. |
| SC3 | Tapping Undo correctly removes the most recent event and decrements its counter; all other player stats are unaffected. |
| SC4 | Navigating to `/live` without Auth0 authentication redirects to the login screen (no data shown). |
| SC5 | A network failure during save shows an error with a Retry option; no data is lost and a retry succeeds if the network recovers. |
| SC6 | The `gso` field no longer appears in any frontend stat table or display. |
