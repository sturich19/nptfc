import { useFormik } from "formik";
import { Season } from "../../objects/season";
import TextField from "../../atoms/textfield/textfield";
import { PostSeason } from "../../services/season-service";
import { useNavigate } from "react-router-dom";

const AdminSeason = ()  =>
{   
    const navigate = useNavigate();  
    const formik = useFormik({
        initialValues :{ startYear: 2024, endYear: 2024, ageGroup : 10, division : 2, monthStart: "September", monthEnd : "May"},
        onSubmit : values => {
            const season : Season = {id : 0, startYear: values.startYear, endYear: values.endYear, ageGroup : values.ageGroup, division : values.division, 
                                    monthStart : values.monthStart, monthEnd : values.monthEnd}
            PostSeason(season).then(formik.resetForm);
        }
    });

    return(
        <>       
            <div>           
                <form onSubmit={formik.handleSubmit}>
                    <div className="row">                        
                        <div className="col-2">
                            <TextField label="Start Year" name="startYear" formik={formik}/>
                        </div>
                        <div className="col-2">
                            <TextField label="End Year" name="endYear" formik={formik}/>
                        </div>
                        <div className="col-2">
                            <TextField label="Age" name="ageGroup" formik={formik}/>
                        </div>
                        <div className="col-2">
                            <TextField label="Division" name="division" formik={formik}/>
                        </div>
                        <div className="col-2">
                            <TextField label="Month start" name="monthStart" formik={formik}/>
                        </div>
                        <div className="col-2">
                            <TextField label="Month End" name="monthEnd" formik={formik}/>
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

export default AdminSeason;