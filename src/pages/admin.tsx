import { useNavigate } from "react-router-dom";

export default function Admin()
{
    const navigate = useNavigate();    

    return(        
        <div className="container-fluid">
            <div className="row">
                <div className="card col-sm-3">
                    <div className="card-body">
                        <h5 className="card-title">Add Result</h5>                    
                        <p className="card-text">This is for the league table</p>
                        <button className="btn btn-primary" onClick={()=> navigate('/AdminLeagueTableUpdate')}>View</button>                        
                    </div>
                </div>
                <div className="card col-sm-3">
                    <div className="card-body">
                        <h5 className="card-title">Add Fixture</h5>                    
                        <p className="card-text">This is a fixture for the season - for any team</p>
                        <button className="btn btn-primary" onClick={()=> navigate('/AdminFixture')}>View</button>                        
                    </div>
                </div>
                <div className="card col-sm-3">
                    <div className="card-body">
                        <h5 className="card-title">Add Tigers Result</h5>                    
                        <p className="card-text">This is a result - just for Tigers</p>
                        <button className="btn btn-primary" onClick={()=> navigate('/AdminTigersFixture')}>View</button>                        
                    </div>
                </div>
                <div className="card col-sm-3">
                    <div className="card-body">
                        <h5 className="card-title">Add Stats</h5>                    
                        <p className="card-text">Add some stats for a user for a fixture</p>
                        <button className="btn btn-primary" onClick={()=> navigate('/AdminGameStats')}>View</button>                        
                    </div>
                </div>
                <div className="card col-sm-3">
                    <div className="card-body">
                        <h5 className="card-title">Add Player</h5>                    
                        <p className="card-text">Add a new player to the team</p>
                        <button className="btn btn-primary" onClick={()=> navigate('/AdminPlayer')}>View</button>                        
                    </div>
                </div>

                <div className="card col-sm-3">
                    <div className="card-body">
                        <h5 className="card-title">Add Season</h5>                    
                        <p className="card-text">Add a new season</p>
                        <button className="btn btn-primary" onClick={()=> navigate('/AdminSeason')}>View</button>                        
                    </div>
                </div>

                <div className="card col-sm-3">
                    <div className="card-body">
                        <h5 className="card-title">Add Team</h5>                    
                        <p className="card-text">Add a new team to the database</p>
                        <button className="btn btn-primary" onClick={()=> navigate('/AdminTeam')}>View</button>                        
                    </div>
                </div>
            </div>      
        </div>  
    )
}