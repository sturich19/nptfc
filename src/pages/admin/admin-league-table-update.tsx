import { useFormik } from "formik";
import { LeagueTable } from "../../objects/league-table";
import { PostLeagueTableResult } from "../../services/league-table-service";
import { useEffect, useState } from "react";
import { GetTeams } from "../../services/teams-service";
import { Team } from "../../objects/team"
import { Season } from "../../objects/season";
import { GetSeasons } from "../../services/season-service";
import TextField from "../../atoms/textfield/textfield";
import { useNavigate } from "react-router-dom";

const AdminLeagueTableUpdate = ()  =>
{
    const navigate = useNavigate();  
    const [teams, setTeams] = useState<Team []>();
    const [seasons, setSeasons] = useState<Season []>();
    
    useEffect(() => {
        GetTeams().then((data) => setTeams(data));   
        GetSeasons().then((data) => setSeasons(data));
    },[])

    const formik = useFormik({
        initialValues :{ team: 0, season: 6, won : 0, lost: 0,drawn : 0, glsFor : 0,glsA : 0 },
        onSubmit : values => {
            const leageTable : LeagueTable = {id : 1, achieveablePoints: 0, gd : 0, pld : 0, points : 0, teamName : "",drawn : values.drawn,
                glsA : values.glsA, glsFor: values.glsFor,lost : values.lost, seasonId : values.season, teamId : values.team, won : values.won
            }
            PostLeagueTableResult(leageTable).then(formik.resetForm);
        }
    });

    return(

        <>       
        <div>           
            <form onSubmit={formik.handleSubmit}>
                <div className="row">
                    <div className="col-2">
                        <label htmlFor="team" className="col-form-label">Team
                            <select id="team" className="form-control" {...formik.getFieldProps("team")}> 
                                <option value="">Select a team</option>
                                {teams?.map(option => (
                                    <option key={option.id} value={option.id}>{option.name}</option>
                                ))}
                            </select>
                        </label>
                    </div>
                    <div className="col-2">
                        <label htmlFor="season" className="col-form-label">Season
                            <select id="season" className="form-control" {...formik.getFieldProps("season")}> 
                                <option value="">Select a season</option>
                                {seasons?.map(option => (
                                    <option key={option.id} value={option.id}>U{option.ageGroup + " " + option.endYear + " (Div " + option.division + ")"}</option>
                                ))}
                            </select>
                        </label>
                    </div>   
                    <div className="row">
                        <div className="col-2">
                            <TextField label="Won" name="won" value="0" formik={formik}/>
                        </div>
                        <div className="col-2">
                            <TextField label="Lost" name="lost" value="0" formik={formik}/>                        
                        </div>   
                        <div className="col-2">
                            <TextField label="Drawn" name="drawn" value="0" formik={formik}/>                        
                        </div>                      
                        <div className="col-2">
                            <TextField label="Gls For" name="glsFor" value="0" formik={formik}/>                        
                        </div>   
                        <div className="col-2">
                            <TextField label="Gls A" name="glsA" value="0" formik={formik}/>
                        </div>  
                    </div>
                    <div className="row">
                        <div className="col-2">
                            <button className="btn btn-secondary" onClick={()=> navigate('/Admin')}>Back</button>    
                            <button className="btn btn-primary" type="submit">Go</button>                                
                        </div>
                        <div className="col-2">
                            
                        </div>
                    </div> 
                </div>
            </form>            
        </div>
        </>
    );
}

export default AdminLeagueTableUpdate;