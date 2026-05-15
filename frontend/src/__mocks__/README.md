# Test Mock Data

This directory contains centralized mock data for testing throughout the application.

## Purpose

Instead of duplicating mock data across multiple test files, this centralized approach provides:

- **Consistency**: All tests use the same mock data structure
- **Maintainability**: Update mock data in one place when interfaces change
- **Reusability**: Import the same mocks across different test files
- **Type Safety**: All mocks are fully typed with TypeScript interfaces

## Usage

### Basic Import

```typescript
import {
  mockSeasons,
  mockTeams,
  mockLeagueTable,
  mockFixtures,
  mockTigersFixtures,
  mockPlayers,
  mockAgeGroups,
} from "../../../__mocks__/test-data";
```

### Using Pre-configured Variations

```typescript
import {
  mockEmptyLeagueTable,
  mockSingleTeamLeagueTable,
  mockTwoTeamLeagueTable,
} from "../../../__mocks__/test-data";

// In your test
(leagueTableService.GetLeagueTable as Mock).mockResolvedValue(
  mockEmptyLeagueTable,
);
```

### Creating Custom Mock Data

Use the helper functions to create variations:

```typescript
import { createMockSeason, createMockTeam } from "../../../__mocks__/test-data";

const customSeason = createMockSeason({
  id: 99,
  ageGroup: 13,
  active: false,
});

const customTeam = createMockTeam({
  id: 10,
  name: "Custom Team",
  isTigers: false,
});
```

## Available Mock Data

### Core Collections

- **mockSeasons**: Array of 3 seasons (1 active, 2 inactive)
- **mockTeams**: Array of 5 teams (Tigers, Lions, Panthers, Wolves, Bears)
- **mockLeagueTable**: Full league table with 3 teams and stats
- **mockFixtures**: Array of 3 league fixtures
- **mockTigersFixtures**: Array of 2 friendly fixtures
- **mockPlayers**: Array of 4 players with different positions
- **mockAgeGroups**: Array of 4 age groups (U10-U13)

### Specialized Variations

- **mockEmptyLeagueTable**: Empty array for testing empty states
- **mockSingleTeamLeagueTable**: League table with 1 team (Tigers)
- **mockTwoTeamLeagueTable**: League table with 2 teams (Tigers, Lions) - useful for fixture testing

### Helper Functions

- `createMockSeason(overrides)`: Create a custom season
- `createMockTeam(overrides)`: Create a custom team
- `createMockFixture(overrides)`: Create a custom fixture
- `createMockLeagueTableEntry(overrides)`: Create a custom league table entry
- `createMockPlayer(overrides)`: Create a custom player

## Example Test Setup

```typescript
import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { mockSeasons, mockTwoTeamLeagueTable } from "../../../__mocks__/test-data";
import * as seasonService from "../../../services/season-service";

describe("MyComponent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (seasonService.GetSeasons as Mock).mockResolvedValue(mockSeasons);
    (leagueTableService.GetLeagueTable as Mock).mockResolvedValue(
      mockTwoTeamLeagueTable,
    );
  });

  it("should render with mock data", async () => {
    // Your test here
  });
});
```

## Updating Mock Data

When updating interfaces or adding new fields:

1. Update the mock data in `test-data.ts`
2. All tests using that mock data will automatically get the updates
3. Fix any TypeScript errors that arise from interface changes

## Best Practices

1. **Use the smallest mock data set needed**: If you only need 2 teams, use `mockTwoTeamLeagueTable` instead of the full `mockLeagueTable`
2. **Use helper functions for custom scenarios**: Don't modify the base mock data directly in tests
3. **Keep mock data realistic**: Use realistic values that reflect actual application data
4. **Document special cases**: If you create a custom mock for a specific edge case, document why

## Adding New Mock Data

When adding new entities:

1. Add the mock data array to `test-data.ts`
2. Add a helper function if applicable
3. Update this README with usage examples
4. Export the new mock data from `test-data.ts`
