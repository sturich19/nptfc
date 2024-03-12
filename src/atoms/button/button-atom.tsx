import Button from "@mui/material/Button";

const ButtonAtom = ({label, clickHandler} : any) => {

    return (
        <div className="col-3 col-sm-2">   
            <Button variant="text" className="form-control" onClick={clickHandler}>{label}</Button>            
        </div>       
    )
}

export default ButtonAtom;