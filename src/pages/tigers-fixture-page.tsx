import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { GetFixtureGameStats } from "../services/game-stat-service";
import { GameStat } from "../objects/game-stat";
import GameStatTable from "../components/game-stats/game-stat-table";
import { GetTigersFixture } from "../services/tigers-fixture-service";
import { TigersFixture } from "../objects/tigers-fixture";
import { FantasyStat } from "../objects/fantasy-stat";
import { GetFixtureFantasyStats } from "../services/fantasy-stat-service";
import FantasyStatTable from "../components/fantasy/fantasy-stat-table";
import { FormatDate } from "../utils/formatter-util";

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
            <div className='row g-0'>
                <div className="col-sm-1 .d-none .d-sm-block"></div>  
                <div className="col-12">
                    {   fixture ? 
                        <>                        
                            <h6 className="header">{fixture.homeTeam}  {fixture.homeTeamScore}   v  {fixture.awayTeamScore}  {fixture.awayTeam} </h6>
                            <h6 className="header">{FormatDate(fixture.date)}</h6>

                        </>
                        : <p>Loading Fixture...</p>}
                </div>
                <div className="col-sm-1 .d-none .d-sm-block"></div>  
            </div>
            
            {/* <div className='row'>
                <div className="col-sm-1 .d-none .d-sm-block"></div>
                <div className="col-10">
                    {   gameStats ? <GameStatTable gameStats={gameStats}></GameStatTable>
                        : <p>Loading Stats...</p>}
                </div>
                <div className="col-sm-1 .d-none .d-sm-block"></div>
            </div>   */}

            <div className='row'>
                <div className="col-sm-1 .d-none .d-sm-block"></div>
                <div className="col-10">
                    {   fantasyStats ? <FantasyStatTable fantasyStats={fantasyStats}></FantasyStatTable>
                        : <p>Loading Stats...</p>}
                </div>
                <div className="col-sm-1 .d-none .d-sm-block"></div>
            </div>  
            <div className='row'>                
                <div className="col-2 button-area">
                    <button className="btn btn-secondary" onClick={()=> navigate('/season/' + fixture?.seasonId)}>Back</button>    
                </div>
            </div>  
        </div>       
    )
}