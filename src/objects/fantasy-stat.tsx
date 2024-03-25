import { Position } from "./enums/enums";

export interface FantasyStat{
    id : number,
    apps : number,
    appsPts : number,
    playerId: number,
    fixtureId : number,
    seasonId : number,
    goals : number,
    goalPts : number,
    assists : number,
    assistsPts : number,
    gso : number,
    gsoPts : number,
    shots : number,
    shotPts : number
    tacklePts : number,
    cleanSheets : number,
    cleanSheetPoints : number,
    playerName : string,
    totalPoints : number,
    saves : number, 
    savesPts : number,
    position : Position,
    penSaves : number,
    penSavesPts : number
}