const TextField = ({label, name, formik} : any) => {

    return (
        <label className="col-form-label">
            {label}<input className="form-control" title={label} type="text" {...formik.getFieldProps({name})}></input>        
        </label>        
    )
}

export default TextField;