import { Box, IconButton, Menu, MenuItem, Typography } from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';
import { useState } from "react";

const HeaderMenuCollapsed = () => {

    const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);    
  
    const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
      setAnchorElNav(event.currentTarget);
    };    
    const handleCloseNavMenu = () => {
      setAnchorElNav(null);
    };  

    return (
        <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleOpenNavMenu}
                color="inherit"                        
            >
                <MenuIcon/>
            </IconButton>
            <Menu id="menu-appbar" anchorEl={anchorElNav}
                anchorOrigin={{vertical: 'bottom',horizontal: 'left',}}
                keepMounted
                transformOrigin={{vertical: 'top',horizontal: 'left',}}
                open={Boolean(anchorElNav)}                
                onClose={handleCloseNavMenu}
                sx={{display: { xs: 'block', md: 'none' },}}>
                   
                   <MenuItem key={"seasons"} >
                        <Typography 
                            component="a" 
                            href="/Seasons" 
                            textAlign="center" 
                            sx={{mr: 2,display: { xs: 'flex', md: 'none' },flexGrow: 1,color: 'inherit',textDecoration: 'none',}}>
                            Home
                        </Typography>
                    </MenuItem>

                    <MenuItem key={"players"} >
                        <Typography 
                            component="a" 
                            href="/Players" 
                            textAlign="center" 
                            sx={{mr: 2,display: { xs: 'flex', md: 'none' },flexGrow: 1,color: 'inherit',textDecoration: 'none',}}>
                        Players
                        </Typography>
                    </MenuItem>  

                    <MenuItem key={"fantasy"} >
                        <Typography 
                            component="a" 
                            href="/Fantasy" 
                            textAlign="center" 
                            sx={{mr: 2,display: { xs: 'flex', md: 'none' },flexGrow: 1,color: 'inherit',textDecoration: 'none',}}>
                        Fantasy
                        </Typography>
                    </MenuItem>  

                    <MenuItem key={"admin"} >
                        <Typography 
                            component="a" 
                            href="/Admin" 
                            textAlign="center" 
                            sx={{mr: 2,display: { xs: 'flex', md: 'none' },flexGrow: 1,color: 'inherit',textDecoration: 'none',}}>
                        Admin
                        </Typography>
                    </MenuItem>     
            </Menu>
        </Box>
    )
}

export default HeaderMenuCollapsed;
