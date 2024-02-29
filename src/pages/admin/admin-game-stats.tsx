import { useFormik } from "formik";
import { useNavigate } from "react-router-dom";
import { Season } from "../../objects/season";
import { useEffect, useState } from "react";
import { GetSeasons } from "../../services/season-service";
import { TigersFixture } from "../../objects/tigers-fixture";
import { GetTigersFixtures } from "../../services/tigers-fixture-service";
import { Player } from "../../objects/player";
import { GetPlayers } from "../../services/player-service";
import { GameStat } from "../../objects/game-stat";
import { PostGameStat } from "../../services/game-stat-service";
import TextField from "../../atoms/textfield/textfield";

const AdminGameStats = ()  =>
{   
    const [seasons, setSeasons] = useState<Season []>();
    const [fixtures, setFixtures] = useState<TigersFixture []>();    
    const [players, setPlayers] = useState<Player []>();

    useEffect(() => {        
        GetSeasons().then((data) => setSeasons(data));
        GetTigersFixtures().then((data) => {setFixtures(data)});
        GetPlayers().then((data) => setPlayers(data));
    },[])


    const navigate = useNavigate();  
    const formik = useFormik({
        initialValues :{ id : 0, player : 0, fixture : 0, goals : 0, assists : 0, gso : 0, apps : 0, playerName: "", shots : 0, tackles : 0, season : 6, shotsOnTarget : 0, shotsOffTarget : 0, cleanSheets : 0, saves : 0},
        onSubmit : values => {
            const gameStat : GameStat = {id : values.id, playerId : values.player, fixtureId : values.fixture, goals : values.goals, assists : values.assists, gso : values.gso, apps : 0, playerName: "", shots : values.shots, tackles : values.tackles, seasonId : values.season,
                                        shotsOnTarget : values.shotsOnTarget, shotsOffTarget : values.shotsOffTarget, cleanSheets : values.cleanSheets, saves : values.saves}
                                                    
            PostGameStat(gameStat).then(formik.resetForm);
        }
    });

    return(
        <>     

            {/* <AdminGameStatsEdit players={players}></AdminGameStatsEdit> */}            
            <div>           
                <form onSubmit={formik.handleSubmit}>
                    <div className="row">   
                        <div className="col-2">
                            <label htmlFor="season" className="col-form-label">Season
                                <select id="season" className="form-control" {...formik.getFieldProps("season")}>
                                    <option>Select your option</option>
                                    {seasons?.map(option => (
                                        <option key={option.id} value={option.id}>U{option.ageGroup + " " + option.endYear + " (Div " + option.division + ")"}</option>
                                    ))} 
                                </select>
                            </label>
                        </div>   
                        <div className="col-3">
                            <label htmlFor="fixture" className="col-form-label">Fixture
                                <select id="fixture" className="form-control" {...formik.getFieldProps("fixture")}>                                     
                                    <option>Select your option</option>
                                    {fixtures?.map(option => (
                                        <option key={option.id} value={option.id}>{new Date(option.date).toLocaleDateString("en-UK") + " - " + option.homeTeam + " vs " + option.awayTeam}</option>
                                    ))}
                                </select>
                            </label>
                        </div>                                                  
                        <div className="col-2">
                            <label htmlFor="player" className="col-form-label">Player
                                <select id="player" className="form-control" {...formik.getFieldProps("player")}>          
                                    <option>Select your option</option>                           
                                    {players?.map(option => (
                                        <option key={option.id} value={option.id}>{option.firstname + " " + option.surname}</option>
                                    ))}
                                </select>
                            </label>
                        </div>                                            
                    </div>
                    <div className="row">
                        <div className="col-2">
                            <TextField label="Goals" name="goals" formik={formik}/>
                            {/* {formik.errors.goals && formik.touched.goals ? <span>{formik.errors.goals}</span> : null} */}
                        </div>
                        <div className="col-2">
                            <TextField label="Assists" name="assists" formik={formik}/>
                            {/* {formik.errors.assists && formik.touched.assists ? <span>{formik.errors.assists}</span> : null} */}
                        </div>
                        <div className="col-2">
                            <TextField label="GSO" name="gso" formik={formik}/>
                            {/* {formik.errors.gso && formik.touched.gso ? <span>{formik.errors.gso}</span> : null} */}
                        </div>
                        <div className="col-2">
                            <TextField label="Shots" name="shots" formik={formik}/>
                            {/* {formik.errors.shots && formik.touched.shots ? <span>{formik.errors.shots}</span> : null}  */}
                        </div>
                        <div className="col-2">
                            <TextField label="Shots On Target" name="shotsOnTarget" formik={formik}/>                            
                        </div>
                        <div className="col-2">
                            <TextField label="Shots Off Target" name="shotsOffTarget" formik={formik}/>                            
                        </div>
                        <div className="col-2">
                            <TextField label="Tackles" name="tackles" formik={formik}/>                            
                        </div>
                        <div className="col-2">
                            <TextField label="Clean Sheets" name="cleanSheets" formik={formik}/>                            
                        </div>
                        <div className="col-2">
                            <TextField label="Saves" name="saves" formik={formik}/>                            
                        </div>
                    </div> 
                   
                    <div className="row">
                        <div className="col-2">
                            <button className="btn btn-secondary" type="button" onClick={()=> navigate('/Admin')}>Back</button>    
                            <button className="btn btn-primary" type="submit">Go</button>    
                        </div>
                    </div> 
                </form>            
            </div>
        </>
    );
}

export default AdminGameStats;




// import { useFormik } from "formik";
// import { useNavigate } from "react-router-dom";
// import { Season } from "../../objects/season";
// import { useEffect, useState } from "react";
// import { GetSeasons } from "../../services/season-service";
// import { TigersFixture } from "../../objects/tigers-fixture";
// import { GetTigersFixtures } from "../../services/tigers-fixture-service";
// import { Player } from "../../objects/player";
// import { GetPlayers } from "../../services/player-service";
// import { GameStat } from "../../objects/game-stat";
// import { PostGameStat } from "../../services/game-stat-service";
// import TextField from "../../atoms/textfield/textfield";
// import AdminGameStat from "../../components/admin/admin-game-stat";

// const AdminGameStats = ()  =>
// {   
//     const [seasons, setSeasons] = useState<Season []>();
//     const [fixtures, setFixtures] = useState<TigersFixture []>();    
//     const [players, setPlayers] = useState<Player []>();

//     useEffect(() => {        
//         GetSeasons().then((data) => setSeasons(data));
//         GetTigersFixtures().then((data) => {setFixtures(data)});
//         GetPlayers().then((data) => setPlayers(data));
//     },[])


//     const navigate = useNavigate();  
//     const formik = useFormik({
//         initialValues :{ id : 0, player : 0, fixture : 0, goals : 0, assists : 0, gso : 0, apps : 0, playerName: "", shots : 0, tackles : 0, season : 0},
//         onSubmit : values => {
//             const gameStat : GameStat = {id : values.id, playerId : values.player, fixtureId : values.fixture, goals : values.goals, assists : values.assists, gso : values.gso, apps : 0, playerName: "", shots : values.shots, tackles : values.tackles, seasonId : values.season}
//             PostGameStat(gameStat).then(formik.resetForm);
//         }
//     });

//     return(
//         <>       
//             <div>           
//                 <form onSubmit={formik.handleSubmit}>
//                     <div className="row">   
//                         <div className="col-2">
//                             <label htmlFor="season" className="col-form-label">Season
//                                 <select id="season" className="form-control" {...formik.getFieldProps("season")}>
//                                     <option>Select your option</option>
//                                     {seasons?.map(option => (
//                                         <option key={option.id} value={option.id}>U{option.ageGroup + " " + option.endYear + " (Div " + option.division + ")"}</option>
//                                     ))} 
//                                 </select>
//                             </label>
//                         </div>   
//                         <div className="col-3">
//                             <label htmlFor="fixture" className="col-form-label">Fixture
//                                 <select id="fixture" className="form-control" {...formik.getFieldProps("fixture")}>                                     
//                                     <option>Select your option</option>
//                                     {fixtures?.map(option => (
//                                         <option key={option.id} value={option.id}>{new Date(option.date).toLocaleDateString("en-UK") + " - " + option.homeTeam + " vs " + option.awayTeam}</option>
//                                     ))}
//                                 </select>
//                             </label>
//                         </div>                                                  
//                         <div className="col-2">
//                             <label htmlFor="player" className="col-form-label">Player
//                                 <select id="player" className="form-control" {...formik.getFieldProps("player")}>          
//                                     <option>Select your option</option>                           
//                                     {players?.map(option => (
//                                         <option key={option.id} value={option.id}>{option.firstname + " " + option.surname}</option>
//                                     ))}
//                                 </select>
//                             </label>
//                         </div>                                            
//                     </div>
//                     <div className="row">
//                         <div className="col-2">
//                             <TextField label="Goals" name="goals" value="0" formik={formik}/>
//                         </div>
//                         <div className="col-2">
//                             <TextField label="Assists" name="assists" value="0" formik={formik}/>
//                         </div>
//                         <div className="col-2">
//                             <TextField label="GSO" name="gso" value="0" formik={formik}/>
//                         </div>
//                         <div className="col-2">
//                             <TextField label="Shots" name="shots" value="0" formik={formik}/>
//                         </div>
//                         <div className="col-2">
//                             <TextField label="Tackles" name="tackles" value="0" formik={formik}/>
//                         </div>
//                     </div> 
                   
//                     <div className="row">
//                         <div className="col-2">
//                             <button className="btn btn-secondary" onClick={()=> navigate('/Admin')}>Back</button>    
//                             <button className="btn btn-primary" type="submit">Go</button>    
//                         </div>
//                     </div> 
//                 </form>            
//             </div>
//         </>
//     );
// }

// export default AdminGameStats;