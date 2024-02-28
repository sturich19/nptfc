import { useFormik } from "formik";
import TextField from "../../atoms/textfield/textfield";
import { useNavigate } from "react-router-dom";
import { PostTeam } from "../../services/teams-service";
import { Team } from "../../objects/team";

const AdminTeam = ()  =>
{   
    const navigate = useNavigate();  
    const formik = useFormik({
        initialValues :{ name: ""},
        onSubmit : values => {
            const team : Team = {id : 0, name: values.name, isTigers : false, isLions : false, isPanthers : false }
            PostTeam(team).then(formik.resetForm);
        }
    });

    return(
        <>       
            <div>           
                <form onSubmit={formik.handleSubmit}>
                    <div className="row">                        
                        <div className="col-6">
                            <TextField label="Team Name" name="name" formik={formik}/>
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

export default AdminTeam;