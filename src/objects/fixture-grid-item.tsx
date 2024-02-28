export interface FixtureGridItem{
    id : number,
    awayTeamId : number,
    awayTeamName? : string,
    homeTeamId : number,
    homeTeamName?: string,    
    seasonId : number,
    homeTeamScore : number,
    awayTeamScore : number,
    date : Date,
    noGame : boolean,
    knownScore : boolean
}
