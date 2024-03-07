import './season-styles.css';
import { useParams } from "react-router-dom";
import { GetTigersFixturesForSeason } from "../../services/tigers-fixture-service";
import { useEffect, useState } from "react";
import { TigersFixture } from "../../objects/tigers-fixture";
import FixtureTable from "../../components/tigers-fixture/tigers-fixture-table";
import { GameType } from "../../objects/enums/enums";
import { GetSeasonGameStats } from "../../services/game-stat-service";
import { GameStat } from "../../objects/game-stat";
import GameStatTable from "../../components/game-stats/game-stat-table";
import { LeagueTable } from "../../objects/league-table";
import { GetLeagueTable } from "../../services/league-table-service";
import LeagueTableComponent from "../../components/league-table/league-table";
import { GetSeasonFantasyStats } from '../../services/fantasy-stat-service';
import { FantasyStat } from '../../objects/fantasy-stat';
import FantasyStatTable from '../../components/fantasy/fantasy-stat-table';
import FixtureGridComponent from '../../components/fixtures/fixture-grid';
import { GetSeason } from '../../services/season-service';
import { Season } from '../../objects/season';
import ButtonAtom from '../../atoms/button/button-atom';

export default function SeasonView()
{
    const param = useParams();
    const [fixtures, setFixtures] = useState<TigersFixture[] | null>(null);
    const [currentSeason, setSeason] = useState<Season | null>(null);
    const [gameStats, setGameStats] = useState<GameStat[] | null>(null);
    const [leagueTable, setLeagueTable] = useState<LeagueTable[] | null>(null);    
    const [fantasyStats, setFantasyStats] = useState<FantasyStat[] | null>(null); 
    const [viewDetails, setViewDetails]  = useState(true);
    const [viewGrid, setViewGrid]  = useState(false);
    const [viewStats, setViewStats]  = useState(false);
    const [viewFantasy, setViewFantasy]  = useState(false);

    useEffect(() => {
        
        GetTigersFixturesForSeason(param.id).then(fixture => setFixtures(fixture));
        GetSeasonGameStats(param.id).then(gameStats => setGameStats(gameStats));
        GetLeagueTable(param.id).then(leagueTable => setLeagueTable(leagueTable));
        GetSeasonFantasyStats(param.id).then(fantasyStats => setFantasyStats(fantasyStats));    
        GetSeason(param.id).then(currentSeason => setSeason(currentSeason));
    }, [param.id]); 

    const handleSideBarItemClick = (index : any) => 
    {
        switch (index) {
            case 0:                
                setViewDetails(true);
                setViewGrid(false);
                setViewStats(false);
                setViewFantasy(false);
                break;

            case 1:
                setViewDetails(false);
                setViewGrid(false);
                setViewStats(true);
                setViewFantasy(false);
                break;

            case 2:
                setViewDetails(false);
                setViewGrid(true);
                setViewStats(false);
                setViewFantasy(false);
                break;   
            
            case 3:
                setViewDetails(false);
                setViewGrid(false);
                setViewStats(false);
                setViewFantasy(true);
                break;                
        }
    }   

    return(  
        <>
        <div className='container-fluid g-0'>
            <div className='row'>                
                <div className='col-12 col-md-10 col-lg-11'>                   
                    { fixtures ? 
                        <>  
                            <div className='container-fluid'>
                                <div className='row'>                                    
                                    <ButtonAtom label="League" clickHander={() => handleSideBarItemClick(0)}></ButtonAtom>
                                    <ButtonAtom label="Grid" clickHander={() => handleSideBarItemClick(2)}></ButtonAtom>                                                                   
                                    <ButtonAtom label="Stats" clickHander={() => handleSideBarItemClick(1)}></ButtonAtom>
                                    <ButtonAtom label="Fantasy" clickHander={() => handleSideBarItemClick(3)}></ButtonAtom>     
                                </div>
                                <div className="row">
                                    <h4 className="season-header">U{currentSeason?.ageGroup}'s Divison {currentSeason?.division} - {currentSeason?.monthStart} to {currentSeason?.monthEnd}</h4>
                                </div>                               
                               
                                {/* League Table */}
                                {viewDetails ?                                 
                                    <div className="row">
                                        <div className="col-1 d-none"></div>
                                        {   leagueTable ? 
                                                <div className="col-10">  
                                                    {leagueTable.length > 0 ? <LeagueTableComponent leagueTableRows={leagueTable}></LeagueTableComponent> : <div></div>}
                                                </div>
                                            : <p>Loading Table...</p>}
                                        <div className="col-1 d-none"></div>
                                    </div>  
                                  :
                                  <div></div>
                                }   
                                
                                {/* Results - league */}
                                {viewDetails ? 
                                    <>
                                        <div className="row">
                                            <div className="col-1"></div>  
                                            <div className="col-10">
                                            <p>Tigers results - click a row to see the match data</p>
                                            </div>  
                                        </div>
                                        <div className="row">
                                            <div className="col-1"></div>
                                            <div className="col-10">                                                                                      
                                                <FixtureTable fixtures={fixtures} gameType={GameType.Any}></FixtureTable>                             
                                            </div>
                                        </div>   
                                    </> 
                                 :
                                 <div></div>
                               }    

                                {/* Team Stats */}
                                {viewStats ?  
                                    <div className="row">
                                        {   gameStats ? 
                                            <>
                                                {gameStats.length > 0 ? 
                                                    <> 
                                                        <div className="col-1"></div> 
                                                        <div className="col-10">       
                                                            <GameStatTable gameStats={gameStats}></GameStatTable>
                                                        </div>                                                        
                                                    </>                                                    
                                                    : <div></div>
                                                }
                                                
                                            </>
                                            : <p>Loading Stats...</p>}
                                    </div>  
                                :
                                 <div></div>
                               } 

                               {viewGrid ? 
                                    <div className='row'>    
                                        <div className="col-1"></div>  
                                        <div className="col-10">                       
                                            <FixtureGridComponent seasonId={param.id}></FixtureGridComponent>
                                        </div>
                                    </div>
                                    :
                                    <div></div>
                                }   

                                {/* Fantasy Stats */}
                                {viewFantasy ?  
                                    <div className="row">
                                        {   fantasyStats ? 
                                            <>
                                                {fantasyStats.length > 0 ? 
                                                    <>
                                                        <div className="col-1"></div> 
                                                        <div className="col-10">       
                                                            <FantasyStatTable fantasyStats={fantasyStats}></FantasyStatTable> : <div></div>
                                                        </div>
                                                    </>
                                                    : <div></div>}
                                            </>
                                            : <p>Loading Stats...</p>}
                                    </div> 
                                    :
                                    <div></div>
                               }    
                            </div>                         
                        </> 
                    : <p>Loading...</p>}
                </div>  
            </div> 
        </div>  
        </>            
    )
}