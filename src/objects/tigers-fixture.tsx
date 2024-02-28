export interface TigersFixture{
    id : number,
    homeTeam?: string,    
    awayTeam? : string
    homeTeamScore : number
    awayTeamScore : number
    date : Date
    result : number
    location : number
    seasonId : number
    type : number
    pts  : number
    glsFor  : number
    glsA  : number
    seasonName? : string
}
