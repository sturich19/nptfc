import { LeagueTable } from "../../objects/league-table";
import LeagueTableRow from "./league-table-row";

interface LeagueTableComponentProps{
    leagueTableRows : LeagueTable[]
}

const LeagueTableComponent = (leagueTableProps : LeagueTableComponentProps) => {      
   
    return(
        <>                       
        <div className="row">            
            <div>
                <table className="table table-hover table-condensed table-responsive">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Pld</th>
                            <th>W</th>
                            <th>D</th>
                            <th>L</th>                                                                                                                        
                            <th>GF</th>  
                            <th>GA</th>  
                            <th>GD</th>  
                            <th>Pts</th>  
                            {/* <th>AP</th>  */}
                        </tr>
                    </thead>
                    <tbody className="table-group-divider">                        
                        {leagueTableProps.leagueTableRows.map(f => <LeagueTableRow key={f.id} leagueTableRow={f} />)}
                    </tbody>
                </table>                          
            </div>
        </div>                
        </>
    );
}
export default LeagueTableComponent;