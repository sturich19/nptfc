import { useFormik } from "formik";
import { useEffect, useState } from "react";
import TextField from "../../atoms/textfield/textfield";
import { useNavigate, useParams } from "react-router-dom";
import { Fixture } from "../../objects/fixture";
import { GetFixture, PutFixture } from "../../services/fixture-service";
import './admin-styles.css';

const AdminLeagueFixtureUpdate = ()  =>
{
    const {id, id2} = useParams();
    const navigate = useNavigate();  
    const [fixture, setFixture] = useState<Fixture>();    
    const [homeTeamScore, setHomeTeamScore] = useState(0);  
    const [awayTeamScore, setAwayTeamScore] = useState(0);  
    
    useEffect(() => {
        GetFixture(id2).then((data) =>
        {
            setFixture(data)
            
            if (fixture != null)
            {
                setHomeTeamScore(fixture.homeTeamScore);
                setAwayTeamScore(fixture.awayTeamScore);
            }
        });     
              
    },[id2])

    const formik = useFormik({
        initialValues :{  homeTeamScore : homeTeamScore, awayTeamScore : awayTeamScore },
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
        <form onSubmit={formik.handleSubmit} className="admin-league-fixture-update">
            <div className="row">
              <h6>{fixture?.homeTeam} {fixture?.homeTeamScore} vs {fixture?.awayTeamScore} {fixture?.awayTeam} </h6>
            </div>
            <div className="row admin-controls-body">
                <div className="col-2">
                    <TextField label="Home Score" name="homeTeamScore" formik={formik}/>
                </div>                    
                <div className="col-2">
                    <TextField label="Away Score" name="awayTeamScore" formik={formik}/>
                </div>                    
            </div>
            
            <div className="row admin-buttons">
                <div className="col-2 col-sm-1 admin-button">
                    <button className="btn btn-secondary" onClick={()=> navigate('/season/' + id)}>Back</button>    
                </div>
                <div className="col-2 col-sm-1 admin-button">
                    <button className="btn btn-primary" type="submit">Go</button>                                
                </div>
                
            </div> 
        </form>  
    );
}

export default AdminLeagueFixtureUpdate;