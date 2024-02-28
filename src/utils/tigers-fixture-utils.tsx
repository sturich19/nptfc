import { GameType } from "../objects/enums/enums";
import { TigersFixture } from "../objects/tigers-fixture"

export interface TigersFixtureProps{
    fixtures : TigersFixture[],
    gameType : GameType
}

export function GetTotalGames (fixtureProps : TigersFixtureProps) {

    return fixtureProps.fixtures.filter(fixture => fixture.type === fixtureProps.gameType).length;
}

export function GetTotalWins (fixtureProps : TigersFixtureProps) {

    const {fixtures, gameType}  = fixtureProps;

    return fixtures.filter(fixture => fixture.result === 0).reduce((sum, fixture) => {
    if (fixture.type === gameType){
        return sum + 1;
    }
    return sum;
},0)}    

export function GetTotalLosses (fixtureProps : TigersFixtureProps) {

    const {fixtures, gameType}  = fixtureProps;

    return fixtures.filter(fixture => fixture.result === 1).reduce((sum, fixture) => {
    if (fixture.type === gameType){
        return sum + 1;
    }
    return sum;
},0)}

export function GetTotalPts (fixtureProps : TigersFixtureProps) {

    const {fixtures, gameType}  = fixtureProps;

    return fixtures.filter(fixture => fixture.pts).reduce((sum, fixture) => {
    if (fixture.type === gameType){
        return sum + fixture.pts;
    }
    return sum;
},0)}

export function GetTotalDraws (fixtureProps : TigersFixtureProps) {

    const {fixtures, gameType}  = fixtureProps;

    return fixtures.filter(fixture => fixture.result === 2).reduce((sum, fixture) => {
    if (fixture.type === gameType){
        return sum + 1;
    }
    return sum;
},0)}

export function GetGlsFor (fixtureProps : TigersFixtureProps) {

    const {fixtures, gameType}  = fixtureProps;

    return fixtures.filter(fixture => fixture.glsFor).reduce((sum, fixture) => {
    if (fixture.type === gameType){
        return sum + fixture.glsFor;
    }
    return sum;
},0)}    

export function GetGlsAgainst  (fixtureProps : TigersFixtureProps) {

    const {fixtures, gameType}  = fixtureProps;

    return fixtures.filter(fixture => fixture.glsA).reduce((sum, fixture) => {
    if (fixture.type === gameType){
        return sum + fixture.glsA;
    }
    return sum;
},0)}    

