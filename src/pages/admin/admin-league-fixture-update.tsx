import { useFormik } from "formik";
import { useEffect, useState } from "react";
import TextField from "../../atoms/textfield/textfield";
import { useNavigate, useParams } from "react-router-dom";
import { Fixture } from "../../objects/fixture";
import { GetFixture, PutFixture } from "../../services/fixture-service";

const AdminLeagueFixtureUpdate = ()  =>
{
    const {id} = useParams();
    const navigate = useNavigate();  
    const [fixture, setFixture] = useState<Fixture>();    
    
    useEffect(() => {
        GetFixture(id).then((data) =>
        {
            setFixture(data)
        });     
              
    },[id])

    const formik = useFormik({
        initialValues :{  homeTeamScore : 0, awayTeamScore : 0 },
        onSubmit : values => {
            if (fixture != null)
            {
                fixture.homeTeamScore = values.homeTeamScore;
                fixture.awayTeamScore = values.awayTeamScore;
                PutFixture(fixture).then(formik.resetForm);
            }
        }
    });

    return(           
        <form onSubmit={formik.handleSubmit}>
            <div className="row">
              <h2>{fixture?.homeTeam} vs {fixture?.awayTeam}</h2>
            </div>
            <div className="row">
                <div className="col-4">
                    <TextField label="Home Team Score" name="homeTeamScore" formik={formik}/>
                </div>                    
                <div className="col-4">
                    <TextField label="Away Team Score" name="awayTeamScore" formik={formik}/>
                </div>                    
            </div>
            
            <div className="row">
                <div className="col-2">
                    <button className="btn btn-secondary" onClick={()=> navigate('/season/' + fixture?.seasonId)}>Back</button>    
                    <button className="btn btn-primary" type="submit">Go</button>                                
                </div>
                <div className="col-2">
                    
                </div>
            </div> 
        </form>  
    );
}

export default AdminLeagueFixtureUpdate;