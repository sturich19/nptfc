import { useEffect, useState } from "react";
import { Player } from "../../objects/player";
import { PositionString } from "../../utils/game-stats-util";
import { GetSeasons } from "../../services/season-service";
import { Season } from "../../objects/season";
import PlayerStatsTableRow from "./player-stats-table-row";

interface playerProps{
    player : Player
}

const PlayerCard = (playerProps : playerProps) => {     

    const [seasons, setSeasons] = useState<Season[] | null>(null);
    
    useEffect(() => {
        GetSeasons().then(seasons => setSeasons(seasons));        
        
    }, [playerProps.player.id]);

    var position = PositionString(playerProps.player.position);

    return(   
        <div className="col-sm-4">
            <div className="card">
                <div className="card-body container-fluid">
                    <h5 className="card-title">{playerProps.player.firstname} {playerProps.player.surname} ({position})</h5>  
                    <div className="row">                        
                        <div className="col-12">
                            <table className="table table-hover table-condensed table-responsive">
                                <thead>
                                    <tr>
                                        <th>Season</th>
                                        <th>Div</th>
                                        <th>Apps</th>
                                        <th>Gls</th>
                                        <th>Ass</th>
                                        <th>GSO</th>
                                        <th>Shots</th>                                
                                    </tr>
                                </thead>
                                <tbody className="table-group-divider">
                                    {seasons?.map(season => 
                                        <PlayerStatsTableRow season={season} player={playerProps.player}></PlayerStatsTableRow>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>        
                </div>
            </div>
        </div>        
    )
}
export default PlayerCard;