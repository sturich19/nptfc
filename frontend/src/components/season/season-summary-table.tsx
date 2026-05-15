import { GameType } from "../../objects/enums/enums";
import { TigersFixture } from "../../objects/tigers-fixture";
import  { GetGlsFor, GetGlsAgainst, GetTotalGames, GetTotalWins, GetTotalLosses, GetTotalDraws, GetTotalPts } from "../../utils/tigers-fixture-utils";

interface SeasonSummaryTableProps{
    fixtures : TigersFixture[],
    gameType : GameType
}

const SeasonSummaryTable = (seasonSummary : SeasonSummaryTableProps) => {  

    const totalGames = GetTotalGames({fixtures : seasonSummary.fixtures, gameType : seasonSummary.gameType});
    const totalWins = GetTotalWins({fixtures : seasonSummary.fixtures, gameType : seasonSummary.gameType});
    const totalDraws = GetTotalLosses({fixtures : seasonSummary.fixtures, gameType : seasonSummary.gameType});
    const totalLosses = GetTotalDraws({fixtures : seasonSummary.fixtures, gameType : seasonSummary.gameType});
    const glsFor = GetGlsFor({fixtures : seasonSummary.fixtures, gameType : seasonSummary.gameType});    
    const glsAgainst = GetGlsAgainst({fixtures : seasonSummary.fixtures, gameType : seasonSummary.gameType});
    const goalDifference = glsFor - glsAgainst;
    const totalPoints =  GetTotalPts({fixtures : seasonSummary.fixtures, gameType : seasonSummary.gameType});

    return (         
        <div className = 'row'>
            
            <div >
                <table className="table table-hover table-condensed table-responsive table-sm">
                    <thead>
                        <tr>
                            <th>PLD</th>
                            <th>W</th>
                            <th>L</th>
                            <th>D</th>
                            <th>GF</th>
                            <th>GA</th>
                            <th>GD</th>
                            <th>Pts</th>
                        </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <td>{totalGames}</td>
                        <td>{totalWins}</td>
                        <td>{totalDraws}</td>
                        <td>{totalLosses}</td>
                        <td>{glsFor}</td>     
                        <td>{glsAgainst}</td>       
                        <td>{goalDifference}</td>
                        <td>{totalPoints}</td>
                    </tr>  
                    </tbody>        
                </table>
            </div>  
        </div>        
    );

}
export default SeasonSummaryTable;