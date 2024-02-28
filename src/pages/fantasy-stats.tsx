import { useEffect, useState } from "react";
import { FantasyStat } from '../objects/fantasy-stat';
import { GetAgeGroupFantasyStats } from '../services/fantasy-stat-service';
import FantasyStatTable from '../components/fantasy/fantasy-stat-table';
import FantasyScoringTable from '../components/fantasy/fantasy-scoring';

export default function FantasyStats()
{
    const [stats, setStats] = useState<FantasyStat[] | null>(null);
    
    useEffect(() => {
        GetAgeGroupFantasyStats(9).then(stats => setStats(stats));
    }, []); 
    
    return(        
        <div>
            { stats ? 
                <>  
                    <div className='container-fluid'>                        
                        <div className="row">
                            <FantasyStatTable fantasyStats={stats}></FantasyStatTable>
                        </div>  
                        <FantasyScoringTable></FantasyScoringTable>  
                    </div>        
                </> 
            : <p>Loading...</p>}
        </div>                
    )
}