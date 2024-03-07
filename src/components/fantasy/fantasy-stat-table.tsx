import { useState } from "react";
import { FantasyStat } from "../../objects/fantasy-stat";
import { PositionString } from "../../utils/game-stats-util";

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

            case "gso":
                fantasyStatsProps.fantasyStats.sort((a , b) => b.gsoPts - a.gsoPts)
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
                    <table className="table table-hover table-condensed table-responsive">
                        <thead>
                            <tr>
                                <th>Player</th>                              
                                <th className="sortable" onClick={() => Sort("pts")}>Pts</th>  
                                <th className="sortable" onClick={() => Sort("pld")}>Apps</th>
                                <th className="sortable" onClick={() => Sort("gls")}>Gls</th>
                                <th className="sortable" onClick={() => Sort("ass")}>Ass</th>
                                <th className="sortable" onClick={() => Sort("gso")}>GSOs</th>
                                <th className="sortable" onClick={() => Sort("shots")}>Shots</th>                                                      
                                <th className="sortable" onClick={() => Sort("cs")}>CS</th> 
                                <th className="sortable" onClick={() => Sort("saves")}>Saves</th> 
                            </tr>
                        </thead>
                        <tbody className="table-group-divider">
                            {fantasyStatsProps.fantasyStats.map(f => 
                                <>
                                    <tr key={f.id}>
                                        <td className="col-2">{f.playerName} ({PositionString(f.position)})</td>                                                                
                                        <td className="col-1">{f.totalPoints}</td>   
                                        <td className="col-1">{f.apps} ({f.appsPts})</td>
                                        <td className="col-1">{f.goals} ({f.goalPts})</td>
                                        <td className="col-1">{f.assists} ({f.assistsPts})</td>
                                        <td className="col-1">{f.gso} ({f.gsoPts})</td>
                                        <td className="col-1">{f.shots} ({f.shotPts})</td>                                
                                        <td className="col-1">{f.cleanSheets} ({f.cleanSheetPoints})</td>  
                                        <td className="col-1">{f.saves} ({f.savesPts})</td>
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