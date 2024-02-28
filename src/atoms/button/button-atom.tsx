import Button from "@mui/material/Button";

const ButtonAtom = ({label, clickHander} : any) => {

    return (
        <div className="col-1">            
            <Button variant="outlined" className="form-control" onClick={clickHander}>{label}</Button>            
        </div>
    )
}

export default ButtonAtom;