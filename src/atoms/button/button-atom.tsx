import Button from "@mui/material/Button";

interface ButtonAtomProps {
    label: string;
    clickHandler: () => void;
    isActive?: boolean;
}

const ButtonAtom = ({label, clickHandler, isActive = false} : ButtonAtomProps) => {

    return (
        <Button
            variant={isActive ? "contained" : "outlined"}
            onClick={clickHandler}
            size="small"
            sx={{
                backgroundColor: isActive ? '#28a745' : 'transparent',
                borderColor: '#28a745',
                color: isActive ? 'white' : '#28a745',
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: '6px',
                px: 2,
                py: 0.5,
                minWidth: 'auto',
                boxShadow: isActive ? '0 2px 4px rgba(40,167,69,0.3)' : 'none',
                transition: 'all 0.2s ease',
                '&:hover': {
                    backgroundColor: isActive ? '#218838' : 'rgba(40, 167, 69, 0.1)',
                    borderColor: '#28a745',
                    color: isActive ? 'white' : '#28a745',
                    transform: 'translateY(-1px)',
                    boxShadow: isActive ? '0 4px 8px rgba(40,167,69,0.4)' : '0 2px 4px rgba(40,167,69,0.2)',
                }
            }}
        >
            {label}
        </Button>
    )
}

export default ButtonAtom;