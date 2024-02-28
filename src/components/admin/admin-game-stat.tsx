import { Player } from "../../objects/player";

interface AdminGameStatProperties
{
    players? : Player[],
    formik : any
}

const AdminGameStat = (adminProps : AdminGameStatProperties) =>
{    

    return(
        <>
            {adminProps.players?.map(player => (
                <div className="row">
                    <div className="col-2">
                        <span>{player.firstname}</span>
                        </div>
            
                </div>    
            ))}        
        </>
    )
}

export default AdminGameStat;