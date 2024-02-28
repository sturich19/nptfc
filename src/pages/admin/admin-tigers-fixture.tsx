import { useFormik } from "formik";
import { useEffect, useState } from "react";
import { GetTeams } from "../../services/teams-service";
import { Team } from "../../objects/team"
import { Season } from "../../objects/season";
import { GetSeasons } from "../../services/season-service";
import TextField from "../../atoms/textfield/textfield";
import { TigersFixture } from "../../objects/tigers-fixture";
import { useNavigate } from "react-router-dom";
import { GameLocation, GameType, ResultType } from "../../objects/enums/enums";
import { PostTigersFixture } from "../../services/tigers-fixture-service";

const AdminTigersFixture = ()  =>
{
    const navigate = useNavigate();  
    const [teams, setTeams] = useState<Team []>();
    const [seasons, setSeasons] = useState<Season []>();

    // Transforming the enum into a list. We then have to remove the numerical values as it does both the key and values.
    const gameTypes = Object.entries(GameType).map(([key, value]) => ({key, value}));    
    const filteredGameTypeOptions = gameTypes.filter(option => !isNaN(Number(option.key)))
    const gameResult = Object.entries(ResultType).map(([key, value]) => ({key, value}));    
    const filteredResultOptions = gameResult.filter(option => !isNaN(Number(option.key)))
    const gameLocation = Object.entries(GameLocation).map(([key, value]) => ({key, value}));    
    const filteredLocationOptions = gameLocation.filter(option => !isNaN(Number(option.key)))
    
    useEffect(() => {
        GetTeams().then((data) => setTeams(data));   
        GetSeasons().then((data) => setSeasons(data));
    },[])

    const formik = useFormik({
        initialValues :{ homeTeam: "", awayTeam: "", homeTeamScore :0, awayTeamScore :0, date: new Date(), result : 0, location : 0,  season: 6, type : 0, pts: 0,  glsFor : 0,glsA : 0 },
        onSubmit : values => {
            const fixture : TigersFixture = {id : 0, homeTeam: values.homeTeam, awayTeam: values.awayTeam, homeTeamScore : values.homeTeamScore, awayTeamScore : values.awayTeamScore, date: values.date, result : parseInt(values.result.toString()), location : parseInt(values.location.toString()),  seasonId: values.season, type : parseInt(values.type.toString()), pts: values.pts,  glsFor : values.glsFor, glsA : values.glsA}
            PostTigersFixture(fixture).then(formik.resetForm);
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
                                <label htmlFor="homeTeam" className="col-form-label">Home Team
                                    <select id="homeTeam" className="form-control" {...formik.getFieldProps("homeTeam")}>                                         
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
                                <label htmlFor="awayTeam" className="col-form-label">Away Team
                                    <select id="awayTeam" className="form-control" {...formik.getFieldProps("awayTeam")}>                                         
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
                                <label htmlFor="result" className="col-form-label">Result
                                    <select id="result" className="form-control" {...formik.getFieldProps("result")}>                                         
                                        {filteredResultOptions?.map(option => (
                                            <option key={option.key} value={option.key}>{option.value}</option>
                                        ))}
                                    </select>
                                </label>      
                            </div>
                            <div className="col-2">
                                <label htmlFor="location" className="col-form-label">Location
                                    <select id="location" className="form-control" {...formik.getFieldProps("location")}>                                         
                                        {filteredLocationOptions?.map(option => (
                                            <option key={option.key} value={option.key}>{option.value}</option>
                                        ))}
                                    </select>
                                </label>                              
                            </div>   
                            <div className="col-2">
                                <label htmlFor="type" className="col-form-label">Game Type
                                    <select id="type" className="form-control" {...formik.getFieldProps("type")}>                                         
                                        {filteredGameTypeOptions?.map(option => (
                                            <option key={option.key} value={option.key}>{option.value}</option>
                                        ))}
                                    </select>
                                </label>                     
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
                        </div> 
                    </div>
                </form>            
            </div>
        </>
    );
}

export default AdminTigersFixture;