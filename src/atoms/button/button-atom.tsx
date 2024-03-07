import Button from "@mui/material/Button";

const ButtonAtom = ({label, clickHander} : any) => {

    return (
        <div className="w-25">            
            <Button variant="outlined" className="form-control" onClick={clickHander}>{label}</Button>            
        </div>
    )
}

export default ButtonAtom;