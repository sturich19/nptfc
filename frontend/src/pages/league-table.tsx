import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { GetLeagueTable } from "../services/league-table-service";
import LeagueTableTable from "../components/league-table/league-table";
import { LeagueTable } from "../objects/league-table";

export default function LeagueTablePage()
{
    const param = useParams();
    const [leagueTable, setLeagueTable] = useState<LeagueTable[] | null>(null);    
    
    useEffect(() => {
        GetLeagueTable(param.id).then(leagueTable => setLeagueTable(leagueTable));
    }, [param.id]);  
    
    return(   
        <>
            <div>
                <div className="row">
                    {   leagueTable ? <LeagueTableTable leagueTableRows={leagueTable}></LeagueTableTable> 
                        : <p>Loading Table...</p>}
                </div>
            </div>            
        </>              
    )
}