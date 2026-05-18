# API Contracts: Live Match Tracker

All endpoints are existing - no new backend endpoints for the tracker.

---

## GET /api/tigersfixtures

Returns all Tigers fixtures. Frontend filters client-side to the upcoming window.

**Response** (array): `TigersFixtureDTO[]`
- Key fields: `id`, `date`, `homeTeamId`, `awayTeamId`, `seasonId`, `homeTeamScore`, `awayTeamScore`, `type` (GameType enum)

---

## GET /api/tigersfixtures/:fixtureId

Returns a single fixture with navigation properties.

**Response**: `TigersFixtureDTO`
- Key fields: same as above; `seasonId` must be present for GameStat assembly

---

## GET /api/players

Returns all active players.

**Response** (array): `Player[]`
- Key fields: `id`, `nickname`, `shirt`, `position` (Position enum: 0=GK, 1=DEF, 2=MID, 3=ATT)

---

## GET /api/GameStats/fixture/:fixtureId

Returns existing GameStats for a fixture. Used to pre-populate squad and counters on resume.

**Response** (array): `GameStatDTO[]`
- Key fields: `playerId`, `played`, all stat counters

---

## POST /api/GameStats/bulk

Upserts a list of GameStats. Existing records (matched by playerId+fixtureId+seasonId) are
updated; new records are created. All-or-nothing within a single SaveChanges call.

**Request body**: `GameStatDTO[]`

```json
[
  {
    "playerId": 7,
    "fixtureId": 42,
    "seasonId": 3,
    "played": true,
    "goals": 2,
    "goalsLeft": 1,
    "goalsRight": 1,
    "goalsOther": 0,
    "assists": 1,
    "shots": 3,
    "shotsOnTarget": 2,
    "shotsOffTarget": 1,
    "shotsLeft": 0,
    "shotsRight": 0,
    "saves": 0,
    "cleanSheets": 0,
    "penSaves": 0,
    "gso": 0
  }
]
```

**Note**: `gso` is sent as 0 for all records (backend field retained; frontend never populates it).
`id` is omitted (0/null) for new records; the upsert key is the playerId+fixtureId+seasonId triple.

**Auth**: Bearer JWT required (same token used across all admin API calls).

**Response**: `200 OK` with processed stats array on success; `400 Bad Request` with error details on failure.
