import { useFormik } from "formik";
import TextField from "../../atoms/textfield/textfield";
import { useNavigate } from "react-router-dom";
import { PostPlayer } from "../../services/player-service";
import { Player } from "../../objects/player";
import { Position } from "../../objects/enums/enums";

const AdminPlayer = ()  =>
{   
    const navigate = useNavigate();  
    const positions = Object.entries(Position).map(([key, value]) => ({key, value}));    
    const filteredPositionOptions = positions.filter(option => !isNaN(Number(option.key)))

    const formik = useFormik({
        initialValues :{ firstname: "", surname: "", position : 0, nickname : ""},
        onSubmit : values => {
            const player : Player = {id : 0, firstname: values.firstname, surname: values.surname, position : parseInt(values.position.toString()), nickname : values.nickname}
            PostPlayer(player).then(formik.resetForm);
        }
    });

    return(
        <>       
            <div>           
                <form onSubmit={formik.handleSubmit}>
                    <div className="row">                        
                        <div className="col-3">
                            <TextField label="First Name" name="firstname" formik={formik}/>
                        </div>
                        <div className="col-3">
                            <TextField label="Surname" name="surname" formik={formik}/>
                        </div>  
                        <div className="col-3">
                            <TextField label="Nickname" name="nickname" formik={formik}/>
                        </div>  
                        <div className="col-3">
                            <label htmlFor="position" className="col-form-label">Game Type
                                    <select id="position" className="form-control" {...formik.getFieldProps("position")}>                                         
                                        {filteredPositionOptions?.map(option => (
                                            <option key={option.key} value={option.key}>{option.value}</option>
                                        ))}
                                    </select>
                                </label>      
                        </div>  
                    </div>
                    <div className="row">
                        <div className="col-2">
                            <button className="btn btn-secondary" onClick={()=> navigate('/Admin')}>Back</button>    
                            <button className="btn btn-primary" type="submit">Go</button>    
                        </div>
                    </div> 
                </form>            
            </div>
        </>
    );
}

export default AdminPlayer;