import { useEffect, useState } from "react";
import { GetPlayers } from '../services/player-service';
import { Player } from '../objects/player';
import PlayerCard from '../atoms/card/player-card';
import { GetSeasons } from "../services/season-service";
import { Season } from "../objects/season";

export default function Players()
{
    const [players, setPlayers] = useState<Player[] | null>(null);
    const [seasons, setSeasons] = useState<Season[] | undefined>();
    
    useEffect(() => {
        GetPlayers().then(player => setPlayers(player));
        GetSeasons().then(seasons => setSeasons(seasons));   
    }, []);  
    
    return(        
        <div>
            { players ? 
                <>  
                    <div className='container-fluid'>
                        {/* Players  */}
                        <div className="row">
                            {players.map((item) => (
                                <PlayerCard key={item.id} player={item} seasons={seasons}></PlayerCard>))}
                        </div>    
                    </div>        
                </> 
            : <p>Loading...</p>}
        </div>                
    )
}