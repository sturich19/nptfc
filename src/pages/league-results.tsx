import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { GetResultsForTeam } from "../services/fixture-service";
import { Fixture } from "../objects/fixture";
import FixtureTable from "../components/fixtures/fixture-table";

export default function LeagueResultsPage()
{
    const navigate = useNavigate(); 
    const {id, id2} = useParams();
    const [teamResults, setTeamResults] = useState<Fixture[] | null>(null);    
    
    useEffect(() => {
        GetResultsForTeam(id, id2).then(teamResults => setTeamResults(teamResults));
     }, [id, id2]);  
    
    return(   
        <>
            <div>               
                <div className="row">     
                    {teamResults ?                
                        <FixtureTable fixtures={teamResults}></FixtureTable> 
                        : <div></div>
                    }
                </div>
                <div className="col-2">
                    <button className="btn btn-secondary" onClick={()=> navigate('/season/' + id)}>Back</button>                        
                </div>
            </div>            
        </>              
    )
}