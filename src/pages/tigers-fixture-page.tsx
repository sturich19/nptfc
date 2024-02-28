import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { GetFixtureGameStats } from "../services/game-stat-service";
import { GameStat } from "../objects/game-stat";
import GameStatTable from "../components/game-stats/game-stat-table";
import { GetTigersFixture } from "../services/tigers-fixture-service";
import { TigersFixture } from "../objects/tigers-fixture";
import SingleFixtureTable from "../components/tigers-fixture/single-tigers-fixture-table";
import { FantasyStat } from "../objects/fantasy-stat";
import { GetFixtureFantasyStats } from "../services/fantasy-stat-service";
import FantasyStatTable from "../components/fantasy/fantasy-stat-table";

export default function TigersFixturePage()
{
    const navigate = useNavigate();  
    const param = useParams();
    const [fixture, setFixture] = useState<TigersFixture | null>(null);
    const [gameStats, setGameStats] = useState<GameStat[] | null>(null);
    const [fantasyStats, setFantasyStats] = useState<FantasyStat[] | null>(null);
    
    useEffect(() => {
        GetTigersFixture(param.id).then(fixture => setFixture(fixture));
        GetFixtureGameStats(param.id).then(gameStats => setGameStats(gameStats));
        GetFixtureFantasyStats(param.id).then(fantasyStats => setFantasyStats(fantasyStats));
    }, [param.id]);  
    
    return(  
        
         <div className='container-fluid g-0'>
            <div className='row'>
                <div className="col-1"></div>
                <div className="col-10">
                    {   fixture ? <SingleFixtureTable fixture={fixture}></SingleFixtureTable> 
                        : <p>Loading Fixture...</p>}
                </div>
            </div>
            
            <div className='row'>
                <div className="col-1"></div>
                <div className="col-10">
                    {   gameStats ? <GameStatTable gameStats={gameStats}></GameStatTable>
                        : <p>Loading Stats...</p>}
                </div>
            </div>  

            <div className='row'>
                <div className="col-1"></div>
                <div className="col-10">
                    {   fantasyStats ? <FantasyStatTable fantasyStats={fantasyStats}></FantasyStatTable>
                        : <p>Loading Stats...</p>}
                </div>
            </div>  
            <div className='row'>
                <div className="col-1"></div>
                <div className="col-2">
                    <button className="btn btn-secondary" onClick={()=> navigate('/season/' + fixture?.seasonId)}>Back</button>    
                </div>
            </div>  
        </div>       
    )
}