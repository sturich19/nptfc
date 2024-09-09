export interface GameStat{
    id : number,
    apps : number,
    playerId: number,
    fixtureId : number,
    seasonId : number,
    goals : number,
    assists : number,
    gso : number,
    shots : number,    
    playerName : string,
    shotsOnTarget : number,
    shotsOffTarget : number,
    saves : number,
    cleanSheets : number,
    penSaves : number,
    shotsLeft : number,
    shotsRight : number
}