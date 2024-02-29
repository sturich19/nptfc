import { useEffect, useState } from "react";
import { Player } from "../../objects/player";
import { GameStat } from "../../objects/game-stat";
import { GetTotalAssists, GetTotalGSO, GetTotalGames, GetTotalGoals, GetTotalShots } from "../../utils/game-stats-util";
import { Season } from "../../objects/season";
import { GetSeasonGameStatsForPlayer } from "../../services/game-stat-service";

interface playerStatsProps{
    player : Player,
    season : Season
}

const PlayerStatsTableRow = (playerStatsProps : playerStatsProps) => {     

    const [gameStats, setGameStats] = useState<GameStat[] | null>(null);
    const [totalGames, setTotalGame] = useState(0);
    const [totalGoals, setGoals] = useState(0);
    const [totalAssist, setAssistGoals] = useState(0);
    const [totalGSOs, setGSOs] = useState(0);    
    const [totalShots, setShots] = useState(0);

    useEffect(() =>
    {
        GetSeasonGameStatsForPlayer(playerStatsProps.season.id, playerStatsProps.player.id).then(gameStats => setGameStats(gameStats));
    })
    
    useEffect(() => {
        if (gameStats != null)
        {
            setTotalGame(GetTotalGames({gameStats : gameStats}));
            setGoals(GetTotalGoals({gameStats : gameStats}));
            setAssistGoals(GetTotalAssists({gameStats : gameStats}));
            setGSOs(GetTotalGSO({gameStats : gameStats}));            
            setShots(GetTotalShots({gameStats : gameStats}));
        }
    }, [gameStats]);    

    return(             
            <tr>
                <td>U{playerStatsProps.season.ageGroup}'s</td>
                <td>{playerStatsProps.season.division}</td>
                <td>{totalGames}</td>
                <td>{totalGoals}</td>
                <td>{totalAssist}</td>
                <td>{totalGSOs}</td>                            
                <td>{totalShots}</td>                
            </tr>                        
    )
}
export default PlayerStatsTableRow;