const TextField = ({label, name, formik} : any) => {

    return (
        <div className="col-3">
            <label className="col-form-label">
                {label}<input className="form-control" title={label} type="text" {...formik.getFieldProps({name})}></input>        
            </label>
        </div>
    )
}

export default TextField;