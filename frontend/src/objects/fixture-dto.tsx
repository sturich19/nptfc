import { GameType } from './enums/game-type';

export interface FixtureDTO {
    id: number;
    homeTeamId: number;
    homeTeam?: string;
    awayTeam?: string;
    awayTeamId: number;
    homeTeamScore: number;
    awayTeamScore: number;
    date: Date;
    seasonId: number;
    knownScore: boolean;
    gameType?: GameType;
}

export interface BulkFixtureDTO {
    fixtures: FixtureDTO[];
}