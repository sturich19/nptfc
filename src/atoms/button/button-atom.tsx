import Button from "@mui/material/Button";

const ButtonAtom = ({label, clickHander} : any) => {

    return (
        <div className="col-2 col-sm-2">   
            <Button variant="text" className="form-control" onClick={clickHander}>{label}</Button>            
        </div>       
    )
}

export default ButtonAtom;