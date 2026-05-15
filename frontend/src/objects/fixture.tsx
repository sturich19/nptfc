export interface Fixture{
    id : number,
    homeTeamId : number,
    homeTeam?: string,    
    awayTeam? : string
    awayTeamId : number,
    homeTeamScore : number
    awayTeamScore : number
    date : Date,
    seasonId : number
}
