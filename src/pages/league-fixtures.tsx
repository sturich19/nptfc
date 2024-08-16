import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { GetResultsForTeam } from "../services/fixture-service";
import FixtureTable from "../components/fixtures/fixture-table";
import { TeamsFixtures } from "../objects/team-fixtures";
import HeaderAtom from "../atoms/header/header-atom";

export default function LeagueFixturesPage()
{
    const navigate = useNavigate(); 
    const {id, id2} = useParams();
    const [teamResults, setTeamResults] = useState<TeamsFixtures | null>(null);        

    useEffect(() => {
        GetResultsForTeam(id, id2).then(teamResults => setTeamResults(teamResults));
     }, [id, id2]);  
    
    return(   
        <>
            <div> 
                <HeaderAtom headerText={teamResults?.teamName}/>
                <div className="row">     
                    {teamResults ?                
                        <FixtureTable fixtures={teamResults.fixtures}></FixtureTable> 
                        : <div></div>
                    }
                </div>
                <div className="col-2 button-area">
                    <button className="btn btn-secondary" onClick={()=> navigate('/season/' + id)}>Back</button>                        
                </div>
            </div>            
        </>              
    )
}