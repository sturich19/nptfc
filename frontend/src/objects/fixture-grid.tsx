import { FixtureGridItem } from "./fixture-grid-item"

export interface FixtureGrid{
    id : number,
    homeTeamName?: string,    
    seasonId : number
    items : FixtureGridItem[]
}
