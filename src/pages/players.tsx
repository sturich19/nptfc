import { useEffect, useState } from "react";
import { GetPlayers } from '../services/player-service';
import { Player } from '../objects/player';
import PlayerCard from '../atoms/card/player-card';

export default function Players()
{
    const [players, setPlayers] = useState<Player[] | null>(null);
    
    useEffect(() => {
        GetPlayers().then(player => setPlayers(player));
    }, []);  
    
    return(        
        <div>
            { players ? 
                <>  
                    <div className='container-fluid'>
                        {/* Players  */}
                        <div className="row">
                            {players.map((item) => (
                                <PlayerCard key={item.id} player={item}></PlayerCard>))}
                        </div>    
                    </div>        
                </> 
            : <p>Loading...</p>}
        </div>                
    )
}