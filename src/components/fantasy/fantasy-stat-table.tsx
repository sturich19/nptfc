import { useState } from "react";
import { FantasyStat } from "../../objects/fantasy-stat";
interface FantasyStatComponentProps{
    fantasyStats : FantasyStat[]    
}

const FantasyStatTable = (fantasyStatsProps : FantasyStatComponentProps) => {      

    const [sort, setSort] = useState(0);

    function Sort(name : string)
    {
        switch (name)
        {
            case "pts":
                fantasyStatsProps.fantasyStats.sort((a , b) => b.totalPoints - a.totalPoints)
                break;

            case "pld":
                fantasyStatsProps.fantasyStats.sort((a , b) => b.appsPts - a.appsPts)
                break;

            case "gls":
                fantasyStatsProps.fantasyStats.sort((a , b) => b.goalPts - a.goalPts)
                break;

            case "ass":
                fantasyStatsProps.fantasyStats.sort((a , b) => b.assistsPts - a.assistsPts)
                break;

            case "shots":
                fantasyStatsProps.fantasyStats.sort((a , b) => b.shotPts - a.shotPts)
                break;

            case "cs":
                fantasyStatsProps.fantasyStats.sort((a , b) => b.cleanSheetPoints - a.cleanSheetPoints)
                break;

            case "saves":
                fantasyStatsProps.fantasyStats.sort((a , b) => b.savesPts - a.savesPts)
                break;
        }
        setSort(sort + 1);
    }


    return(
        <>         
                      
            <div className="row">            
                <div>
                    <table className="table table-hover table-condensed table-responsive table-sm">
                        <thead>
                            <tr>
                                <th>Player</th>                              
                                <th className="sortable" onClick={() => Sort("pts")}>Pts</th>  
                                <th className="sortable" onClick={() => Sort("pld")}>Apps</th>
                                <th className="sortable" onClick={() => Sort("gls")}>Gls</th>
                                <th className="sortable" onClick={() => Sort("ass")}>Ass</th>
                                <th className="sortable" onClick={() => Sort("shots")}>Shots</th>                                                      
                                <th className="sortable" onClick={() => Sort("cs")}>CS</th>
                                <th className="sortable" onClick={() => Sort("saves")}>Saves</th> 
                            </tr>
                        </thead>
                        <tbody className="table-group-divider">
                            {fantasyStatsProps.fantasyStats.map(f => 
                                <>
                                    <tr key={f.id}>
                                        <td>{f.playerName}</td>                                                                
                                        <td>{f.totalPoints}</td>   
                                        <td>{f.apps} ({f.appsPts})</td>
                                        <td>{f.goals} ({f.goalPts})</td>
                                        <td>{f.assists} ({f.assistsPts})</td>
                                        <td>{f.shots} ({f.shotPts})</td>                                
                                        <td>{f.cleanSheets} ({f.cleanSheetPoints})</td>
                                        <td>{f.saves} ({f.savesPts})</td>
                                    </tr>
                                </>
                            )}
                        </tbody>
                    </table>                          
                </div>
            </div>  

                           
        </>
    );
}
export default FantasyStatTable;