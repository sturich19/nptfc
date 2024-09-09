import { useEffect, useState } from 'react';
import { GetSeasonsForAgeGroup } from "../services/season-service";
import { Season } from "../objects/season";
import SeasonCard from "../atoms/card/season-card";
import { useNavigate, useParams } from "react-router-dom";
import FantasyStats from './fantasy-stats';
import { GameStat } from '../objects/game-stat';
import GameStatTable from '../components/game-stats/game-stat-table';
import { GetAgeGroupGameStats } from '../services/game-stat-service';

const SeasonSelection = () => {
    
    const param = useParams();
    const navigate = useNavigate();
    const [seasons, setData] = useState<Season[] | null>(null);
    const [gameStats, setGameStats] = useState<GameStat[] | null>(null);
    
    useEffect(() => {
        GetSeasonsForAgeGroup(param.id).then(seasons => setData(seasons));
        GetAgeGroupGameStats(param.id).then(gameStats => setGameStats(gameStats));
    }, [param.id]);   

    const handleClick = (seasonId : any) => navigate('/Season/' + seasonId);

    return(
        <>
            <div className="container-fluid">
                <div className="row">       
                    {   seasons ? seasons.map((item) => ( 
                            <SeasonCard key={item.id} season={item} handleClick={handleClick} > </SeasonCard>                            
                    )) : <p>Loading Seasons...</p>}                        
                </div>   
                <div className="row">
                    {   gameStats ? 
                        <>
                            {gameStats.length > 0 ? 
                                <> 
                                    <h3>Age Group Stats</h3>
                                    <GameStatTable gameStats={gameStats}></GameStatTable>
                                </>                                                    
                                : <div></div>
                            }                            
                        </>
                        : <p>Loading Stats...</p>
                    }
                </div>  
                <div className="row">
                    <h3>Fantasy Stats</h3>
                    <FantasyStats ageGroup={param.id}></FantasyStats>
                </div>
            </div>

        </>
    )
}
export default SeasonSelection;