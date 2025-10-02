import { Season } from "../objects/season";
import { Team } from "../objects/team";
import { LeagueTable } from "../objects/league-table";
import { Fixture } from "../objects/fixture";
import { TigersFixture } from "../objects/tigers-fixture";
import { Player } from "../objects/player";
import { AgeGroup } from "../objects/age-group";

/**
 * Centralized mock data for testing across the application
 */

// Seasons
export const mockSeasons: Season[] = [
  {
    id: 1,
    ageGroup: 10,
    division: 1,
    startYear: 2024,
    endYear: 2025,
    monthStart: "September",
    monthEnd: "May",
    active: true,
  },
  {
    id: 2,
    ageGroup: 11,
    division: 2,
    startYear: 2023,
    endYear: 2024,
    monthStart: "September",
    monthEnd: "May",
    active: false,
  },
  {
    id: 3,
    ageGroup: 12,
    division: 1,
    startYear: 2022,
    endYear: 2023,
    monthStart: "September",
    monthEnd: "May",
    active: false,
  },
];

// Teams
export const mockTeams: Team[] = [
  { id: 1, name: "Tigers", isTigers: true, isLions: false, isPanthers: false },
  { id: 2, name: "Lions", isTigers: false, isLions: true, isPanthers: false },
  { id: 3, name: "Panthers", isTigers: false, isLions: false, isPanthers: true },
  { id: 4, name: "Wolves", isTigers: false, isLions: false, isPanthers: false },
  { id: 5, name: "Bears", isTigers: false, isLions: false, isPanthers: false },
];

// League Tables
export const mockLeagueTable: LeagueTable[] = [
  {
    id: 1,
    teamId: 1,
    teamName: "Tigers",
    seasonId: 1,
    pld: 10,
    won: 7,
    drawn: 2,
    lost: 1,
    glsFor: 25,
    glsA: 10,
    gd: 15,
    points: 23,
    achieveablePoints: 30,
    winPercentage: 70,
  },
  {
    id: 2,
    teamId: 2,
    teamName: "Lions",
    seasonId: 1,
    pld: 10,
    won: 6,
    drawn: 2,
    lost: 2,
    glsFor: 20,
    glsA: 12,
    gd: 8,
    points: 20,
    achieveablePoints: 30,
    winPercentage: 60,
  },
  {
    id: 3,
    teamId: 3,
    teamName: "Panthers",
    seasonId: 1,
    pld: 10,
    won: 5,
    drawn: 3,
    lost: 2,
    glsFor: 18,
    glsA: 15,
    gd: 3,
    points: 18,
    achieveablePoints: 30,
    winPercentage: 50,
  },
];

// Empty league table (for testing empty states)
export const mockEmptyLeagueTable: LeagueTable[] = [];

// League table with single team (for edge cases)
export const mockSingleTeamLeagueTable: LeagueTable[] = [
  {
    id: 1,
    teamId: 1,
    teamName: "Tigers",
    seasonId: 1,
    pld: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    glsFor: 0,
    glsA: 0,
    gd: 0,
    points: 0,
    achieveablePoints: 0,
    winPercentage: 0,
  },
];

// League table with two teams (minimal for fixture testing)
export const mockTwoTeamLeagueTable: LeagueTable[] = [
  {
    id: 1,
    teamId: 1,
    teamName: "Tigers",
    seasonId: 1,
    pld: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    glsFor: 0,
    glsA: 0,
    gd: 0,
    points: 0,
    achieveablePoints: 0,
    winPercentage: 0,
  },
  {
    id: 2,
    teamId: 2,
    teamName: "Lions",
    seasonId: 1,
    pld: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    glsFor: 0,
    glsA: 0,
    gd: 0,
    points: 0,
    achieveablePoints: 0,
    winPercentage: 0,
  },
];

// Fixtures
export const mockFixtures: Fixture[] = [
  {
    id: 1,
    homeTeamId: 1,
    awayTeamId: 2,
    homeTeamScore: 3,
    awayTeamScore: 1,
    date: new Date("2024-09-07"),
    seasonId: 1,
  },
  {
    id: 2,
    homeTeamId: 3,
    awayTeamId: 4,
    homeTeamScore: 2,
    awayTeamScore: 2,
    date: new Date("2024-09-14"),
    seasonId: 1,
  },
  {
    id: 3,
    homeTeamId: 2,
    awayTeamId: 3,
    homeTeamScore: 1,
    awayTeamScore: 0,
    date: new Date("2024-09-21"),
    seasonId: 1,
  },
];

// Tigers Fixtures (Friendlies)
export const mockTigersFixtures: TigersFixture[] = [
  {
    id: 1,
    homeTeam: "Tigers",
    awayTeam: "Friendly Team A",
    homeTeamScore: 2,
    awayTeamScore: 2,
    date: new Date("2024-09-14"),
    result: 0, // Draw
    location: 0, // Home
    seasonId: 1,
    type: 1, // Friendly
    glsFor: 2,
    glsA: 2,
  },
  {
    id: 2,
    homeTeam: "Friendly Team B",
    awayTeam: "Tigers",
    homeTeamScore: 1,
    awayTeamScore: 3,
    date: new Date("2024-09-28"),
    result: 1, // Win
    location: 1, // Away
    seasonId: 1,
    type: 1, // Friendly
    glsFor: 3,
    glsA: 1,
  },
];

// Players
export const mockPlayers: Player[] = [
  {
    id: 1,
    firstName: "John",
    lastName: "Smith",
    dateOfBirth: new Date("2014-05-15"),
    squadNumber: 7,
    position: "Forward",
    active: true,
  },
  {
    id: 2,
    firstName: "Emma",
    lastName: "Johnson",
    dateOfBirth: new Date("2014-08-20"),
    squadNumber: 10,
    position: "Midfielder",
    active: true,
  },
  {
    id: 3,
    firstName: "Michael",
    lastName: "Brown",
    dateOfBirth: new Date("2013-11-10"),
    squadNumber: 1,
    position: "Goalkeeper",
    active: true,
  },
  {
    id: 4,
    firstName: "Sarah",
    lastName: "Wilson",
    dateOfBirth: new Date("2014-03-25"),
    squadNumber: 5,
    position: "Defender",
    active: false,
  },
];

// Age Groups
export const mockAgeGroups: AgeGroup[] = [
  { id: 1, name: "U10", minAge: 9, maxAge: 10 },
  { id: 2, name: "U11", minAge: 10, maxAge: 11 },
  { id: 3, name: "U12", minAge: 11, maxAge: 12 },
  { id: 4, name: "U13", minAge: 12, maxAge: 13 },
];

// Helper functions for creating variations of mock data

/**
 * Create a season with custom properties
 */
export const createMockSeason = (overrides: Partial<Season>): Season => ({
  ...mockSeasons[0],
  ...overrides,
});

/**
 * Create a team with custom properties
 */
export const createMockTeam = (overrides: Partial<Team>): Team => ({
  ...mockTeams[0],
  ...overrides,
});

/**
 * Create a fixture with custom properties
 */
export const createMockFixture = (overrides: Partial<Fixture>): Fixture => ({
  ...mockFixtures[0],
  ...overrides,
});

/**
 * Create a league table entry with custom properties
 */
export const createMockLeagueTableEntry = (
  overrides: Partial<LeagueTable>,
): LeagueTable => ({
  ...mockLeagueTable[0],
  ...overrides,
});

/**
 * Create a player with custom properties
 */
export const createMockPlayer = (overrides: Partial<Player>): Player => ({
  ...mockPlayers[0],
  ...overrides,
});
