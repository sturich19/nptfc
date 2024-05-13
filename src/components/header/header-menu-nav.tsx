import { Box, Button} from "@mui/material";

const HeaderMenuNav = () => {   
    return (        
        <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            <Button key={"seasons"}
                href="/Seasons"
                sx={{ my: 2, color: 'white', display: 'block' }}
            >
            Home
            </Button>
            <Button key={"players"}
                href="/Players"
                sx={{ my: 2, color: 'white', display: 'block' }}
            >
            Players
            </Button>                         
            <Button key={"admin"}
                href="/Admin"
                sx={{ my: 2, color: 'white', display: 'block' }}
            >
            Admin
            </Button>           
        </Box>        
    )
}

export default HeaderMenuNav;
