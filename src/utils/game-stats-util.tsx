import { Position } from "../objects/enums/enums";
import { GameStat } from "../objects/game-stat";

export interface GameStatsProps{
    gameStats : GameStat[]
}

export function GetTotalGames (gameStatProps : GameStatsProps) {

    if (gameStatProps.gameStats == null)
        return 0;

    return gameStatProps.gameStats.length;
}

export function GetTotalGoals (gameStatProps : GameStatsProps) {    

    if (gameStatProps.gameStats.length === 1)
        return gameStatProps.gameStats[0].goals;

    return gameStatProps.gameStats.reduce((totalGoals, gameStat) => {
     return totalGoals + gameStat.goals;
},0)}  

export function GetTotalAssists (gameStatProps : GameStatsProps) {    

    return gameStatProps.gameStats.reduce((totalAssists, gameStat) => {
     return totalAssists + gameStat.assists;
},0)} 

export function GetTotalGSO (gameStatProps : GameStatsProps) {    

    return gameStatProps.gameStats.reduce((totalGSO, gameStat) => {
     return totalGSO + gameStat.gso;
},0)} 

export function GetTotalShots (gameStatProps : GameStatsProps) {    

    return gameStatProps.gameStats.reduce((totalShots, gameStat) => {
     return totalShots + gameStat.shots;
},0)} 

export function GetTotalShotsLeftFoot (gameStatProps : GameStatsProps) {    

    return gameStatProps.gameStats.reduce((totalShotsLeft, gameStat) => {
     return totalShotsLeft + gameStat.shotsLeft;
},0)} 

export function GetTotalShotsRightFoot (gameStatProps : GameStatsProps) {    

    return gameStatProps.gameStats.reduce((totalShotsRightFoot, gameStat) => {
     return totalShotsRightFoot + gameStat.shotsRight;
},0)} 

export function PositionString (playerPosition : Position)
{
    var position = "";
    switch(playerPosition)  
    {
        case 0: 
            position = "GK";
            break;

        case 1: 
            position = "Def";
            break;

        case 2: 
            position = "Mid";
            break;

        case 3: 
            position = "Str";
            break;

    }

    return position;
}

export function Average( value : number, value2 : number)
{
    return (value / value2).toFixed(1);
}