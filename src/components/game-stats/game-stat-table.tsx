import { useState } from "react";
import { GameStat } from "../../objects/game-stat";
import { Average } from "../../utils/game-stats-util";

interface GameStatComponentProps{
    gameStats : GameStat[]    
}

const GameStatTable = (gameStatProps : GameStatComponentProps) => {      

    const [sort, setSort] = useState(0);

    function Sort(name : string)
    {
        switch (name)
        {
            case "pld":
                gameStatProps.gameStats.sort((a , b) => b.apps - a.apps)
                break;

            case "gls":
                gameStatProps.gameStats.sort((a , b) => b.goals - a.goals)
                break;

            case "ass":
                gameStatProps.gameStats.sort((a , b) => b.assists - a.assists)
                break;

            case "gso":
                gameStatProps.gameStats.sort((a , b) => b.gso - a.gso)
                break;

            case "shots":
                gameStatProps.gameStats.sort((a , b) => b.shots - a.shots)
                break;

            case "shotsOn":
                gameStatProps.gameStats.sort((a , b) => b.shotsOnTarget - a.shotsOnTarget)
                break;

            case "shotsOff":
                gameStatProps.gameStats.sort((a , b) => b.shotsOffTarget - a.shotsOffTarget)
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
                            <th className="sortable" onClick={() => Sort("pld")}>Pld</th>
                            <th className="sortable" onClick={() => Sort("gls")}>Goals</th>
                            <th className="sortable" onClick={() => Sort("ass")}>Assists</th>
                            <th className="sortable" onClick={() => Sort("gso")}>GSOs</th>
                            <th className="sortable" onClick={() => Sort("shots")}>Shots</th>
                            <th className="sortable" onClick={() => Sort("shotsOn")}>Shots On</th>
                            <th className="sortable" onClick={() => Sort("shotsOff")}>Shots Off</th>
                            <th>CS</th>  
                            <th>Saves</th>  
                        </tr>
                    </thead>
                    <tbody className="table-group-divider">
                        {gameStatProps.gameStats.map(f => 
                            <>
                            <tr key={f.id}>
                                <td className="col-3">{f.playerName}</td>                                
                                <td className="col-1">{f.apps}</td>
                                <td className="col-1">{f.goals} ({Average(f.goals, f.apps)})</td>
                                <td className="col-1">{f.assists} ({Average(f.assists, f.apps)})</td>
                                <td className="col-1">{f.gso} ({Average(f.gso, f.apps)})</td>
                                <td className="col-1">{f.shots} ({Average(f.shots, f.apps)})</td>
                                <td className="col-1">{f.shotsOnTarget} ({Average(f.shotsOnTarget, f.shots)})</td>
                                <td className="col-1">{f.shotsOffTarget} ({Average(f.shotsOffTarget, f.shots)})</td>                                
                                <td className="col-1">{f.cleanSheets} ({Average(f.cleanSheets, f.apps)})</td>  
                                <td className="col-1">{f.saves} ({Average(f.saves, f.apps)})</td>  
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
export default GameStatTable;