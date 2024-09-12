import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { GetHistoryFixture } from "../services/fixture-service";
import { Fixture } from "../objects/fixture";
import FixtureTable from "../components/fixtures/fixture-table";

const LeagueFixtureHistory = ()  =>
{
   const {id, id2} = useParams();    
   const [fixtures, setFixtures] = useState<Fixture[] | null>(null);

   useEffect(() => {
      GetHistoryFixture(id2).then(fixtures => setFixtures(fixtures));
   },[]); 

   const navigate = useNavigate();

   function handleResultClick(fixtureId : number)
   {         
      navigate(`/AdminLeagueFixtureUpdate/${id}/${id2}`);
   }


   return(
      <>
         <div className="row">          
            <div className="col-12">
                  {fixtures ? 
                     <FixtureTable fixtures={fixtures} handleClick={handleResultClick}></FixtureTable> 
                     :
                     <div></div>
                  }
            </div>
         </div>    
         <div className="row">
            <div className="col-2 button-area">
               <button className="btn btn-secondary" onClick={()=> navigate('/season/' + id)}>Back</button>                                       
            </div>         
         </div>        
   </>              
   )
}

export default LeagueFixtureHistory;