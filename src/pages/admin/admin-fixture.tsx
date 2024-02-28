import { useFormik } from "formik";
import { useEffect, useState } from "react";
import { GetTeams } from "../../services/teams-service";
import { Team } from "../../objects/team"
import { Season } from "../../objects/season";
import { GetSeasons } from "../../services/season-service";
import TextField from "../../atoms/textfield/textfield";
import { Fixture } from "../../objects/fixture";
import { useNavigate } from "react-router-dom";
import { PostFixture } from "../../services/fixture-service";

const AdminFixture = ()  =>
{
    const navigate = useNavigate();  
    const [teams, setTeams] = useState<Team []>();
    const [seasons, setSeasons] = useState<Season []>();

    useEffect(() => {
        GetTeams().then((data) => setTeams(data));   
        GetSeasons().then((data) => setSeasons(data));
    },[])

    const formik = useFormik({
        initialValues :{ homeTeamId: 0, awayTeamId: 0, homeTeamScore :0, awayTeamScore :0, date: new Date(), season: 6},
        onSubmit : values => {
            const fixture : Fixture = {id : 0, homeTeamId: values.homeTeamId, awayTeamId: values.awayTeamId, homeTeamScore : values.homeTeamScore, awayTeamScore : values.awayTeamScore, date: values.date, seasonId: values.season}
            PostFixture(fixture).then(formik.resetForm);
        }
    });

    return(
        <>       
            <div>           
                <form onSubmit={formik.handleSubmit}>
                    <div className="row">
                        <div className="col-2">
                            <label htmlFor="season" className="col-form-label">Season
                                <select id="season" className="form-control" {...formik.getFieldProps("season")}>                                     
                                    {seasons?.map(option => (
                                        <option key={option.id} value={option.id}>U{option.ageGroup + " " + option.endYear + " (Div " + option.division + ")"}</option>
                                    ))}
                                </select>
                            </label>
                        </div>   
                        <div className="col-2">
                            <label htmlFor="date" className="col-form-label">Date
                                <input type="date" className="form-control" {...formik.getFieldProps("date")} />
                            </label>
                            
                        </div>
                        <div className="row">
                            <div className="col-2">
                                <label htmlFor="homeTeamId" className="col-form-label">Home Team
                                    <select id="homeTeamId" className="form-control" {...formik.getFieldProps("homeTeamId")}>                                         
                                        {teams?.map(option => (
                                            <option key={option.id} value={option.id}>{option.name}</option>
                                        ))}
                                    </select>
                                </label>
                            </div>
                            <div className="col-2">
                                <TextField label="Score" name="homeTeamScore" value="0" formik={formik}/>
                            </div>
                            <div className="col-2">
                                <label htmlFor="awayTeamId" className="col-form-label">Away Team
                                    <select id="awayTeamId" className="form-control" {...formik.getFieldProps("awayTeamId")}>                                         
                                        {teams?.map(option => (
                                            <option key={option.id} value={option.id}>{option.name}</option>
                                        ))}
                                    </select>
                                </label>
                            </div>
                            <div className="col-2">
                                <TextField label="Score" name="awayTeamScore" value="0" formik={formik}/>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-2">
                                <button className="btn btn-secondary" onClick={()=> navigate('/Admin')}>Back</button>    
                                <button className="btn btn-primary" type="submit">Go</button>    
                            </div>
                        </div> 
                    </div>
                </form>            
            </div>
        </>
    );
}

export default AdminFixture;