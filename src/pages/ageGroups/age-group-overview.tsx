import { useEffect, useState } from 'react';
import { GetSeasonsForAgeGroup } from "../../services/season-service";
import { Season } from "../../objects/season";
import { useParams } from "react-router-dom";
import FantasyStats from '../fantasy-stats';
import { GameStat } from '../../objects/game-stat';
import GameStatTable from '../../components/game-stats/game-stat-table';
import { GetAgeGroupGameStats } from '../../services/game-stat-service';

const AgeGroupOverview = () => {
    
    const param = useParams();    
    const [seasons, setData] = useState<Season[] | null>(null);
    const [gameStats, setGameStats] = useState<GameStat[] | null>(null);
    
    useEffect(() => {
        GetSeasonsForAgeGroup(param.id).then(seasons => setData(seasons));
        GetAgeGroupGameStats(param.id).then(gameStats => setGameStats(gameStats));
    }, [param.id]);       

    return(
        <>
            <div className="container-fluid">                
                <div className='row page-header'>
                    <h3>U{seasons != null ? seasons[0].ageGroup : ""} Overview</h3>
                </div>
                <div className="row">
                    <div className='col-sm-1 .d-none .d-sm-block"'></div>
                    {   gameStats ? 
                        <>
                            {gameStats.length > 0 ? 
                                <>    
                                    <div className="col-12 col-sm-10">                                   
                                        <h4>Season Stats</h4>
                                        <GameStatTable gameStats={gameStats}></GameStatTable>
                                    </div>
                                </>                                                    
                                : <div></div>
                            }                            
                        </>
                        : <p>Loading Stats...</p>
                    }
                    <div className='col-sm-1 .d-none .d-sm-block"'></div>
                </div>  
                <div className="row">
                    <div className='col-sm-1 .d-none .d-sm-block"'></div>
                    <div className="col-12 col-sm-10">
                        <h4>Fantasy Scores</h4>
                        <FantasyStats ageGroup={param.id}></FantasyStats>
                    </div>
                    <div className='col-sm-1 .d-none .d-sm-block"'></div>
                </div>
            </div>

        </>
    )
}
export default AgeGroupOverview;