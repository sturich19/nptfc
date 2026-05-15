import { Player } from "../../objects/player";
import { useState } from "react";

interface AdminGameStatProps {
    players? : Player[]
}

const AdminGameStatsEdit = (adminProps : AdminGameStatProps)  =>
{   

    const [gameStats, setGameStats] = useState(adminProps.players?.map(player => ({
        PlayerId: player.id,
        id : 0, playerId : player.id, fixture : 0, goals : 0, goalsLeft : 0, goalsRight : 0, goalsOther : 0, assists : 0, gso : 0, apps : 0, playerName: player.firstname + ' ' + player.surname, shots : 0, season : 0
    })));

    const handleStatChange = (playerId : number, field : any, value : string) => {
        alert(playerId + field + value);
        
        setGameStats(currentStats =>
          currentStats?.map(stat =>
            stat.PlayerId === playerId ? { ...stat, [field]: value } : stat
          )
        );
        alert(gameStats?.length);
      };


    const handleSubmit = () => {
        alert(gameStats?.length);
    }
  
    return(
   
                
        <form onSubmit={handleSubmit}>

            {adminProps.players?.map(player => (
                <div className="row" key={player.id}>
                    <label>{player.firstname + " " + player.surname}</label>
                    <div className="col-2">
                        <input  type="number" 
                                placeholder="goals"
                                onChange={e => handleStatChange(player.id, 'goals', e.target.value)}/>
                </div>
            </div>

            ))}

            
            <div className="row">
                <div className="col-2">                                
                    <button className="btn btn-primary" type="submit">Go</button>    
                </div>
            </div> 
        </form>            
                
          
    );
}

export default AdminGameStatsEdit;




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