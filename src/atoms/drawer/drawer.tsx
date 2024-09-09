import { Box, Collapse, Divider, Drawer, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, ListSubheader } from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import HomeIcon from '@mui/icons-material/Home';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import InboxIcon from '@mui/icons-material/Inbox';
import AdminIcon from '@mui/icons-material/AdminPanelSettings';
import SignoutIcon from '@mui/icons-material/ExitToApp';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GetSeasons } from "../../services/season-service";
import { Season } from "../../objects/season";

const DrawerAtom = () => {

    const [open, setOpen] = useState(false);    
    const [seasons, setSeasons] = useState<Season[] | null>(null);
    const navigate = useNavigate();
    
    useEffect(() => {
        GetSeasons().then(seasons => setSeasons(seasons));
    }, []);  

    const toggleDrawer = (newOpen: boolean) => () => {
      setOpen(newOpen);
    };
   
    return (
        <>
            <IconButton onClick={toggleDrawer(true)} aria-label="Menu"> 
                <MenuIcon/>   
            </IconButton>            
            <Drawer open={open} onClose={toggleDrawer(false)}>
                <Box sx={{ width: 250 }} role="presentation" onClick={toggleDrawer(false)}>
                    <List>  
                        <ListItem key={"home"} divider disablePadding>
                            <ListItemButton onClick={() => navigate('/AgeGroups')}>
                                <ListItemIcon><HomeIcon/></ListItemIcon>
                                <ListItemText primary={'Home'} />
                            </ListItemButton>                           
                        </ListItem>

                        {/* Age Groups */}
                        <ListSubheader component="div" id="ageGroups-subheader">
                            Age Groups
                        </ListSubheader>
                        <List component="div" disablePadding>
                            {seasons?.map(season => 
                                <ListItem key={season.id} disablePadding onClick={() => navigate('/season/' + season.id)}> 
                                    <ListItemButton>
                                        <ListItemIcon><SportsSoccerIcon/></ListItemIcon>
                                        <ListItemText primary={"U" + season.ageGroup + "s Div - " + season.division} />
                                    </ListItemButton>                           
                                </ListItem>
                            )}
                        </List>
                        
                        <ListItem key={"players"} divider disablePadding>
                            <ListItemButton onClick={() => navigate('/Players')}>
                                <ListItemIcon><DirectionsRunIcon/></ListItemIcon>
                                <ListItemText primary={'Players'} />
                            </ListItemButton>                           
                        </ListItem>
                        
                        <ListItem key={"admin"} divider disablePadding>
                            <ListItemButton onClick={() => navigate('/Admin')}>
                                <ListItemIcon><AdminIcon/></ListItemIcon>
                                <ListItemText primary={'Admin'} />
                            </ListItemButton>                           
                        </ListItem>

                        <ListItem key={"signout"} divider disablePadding>
                            <ListItemButton onClick={() => navigate('/Logout')}>
                                <ListItemIcon><SignoutIcon/></ListItemIcon>
                                <ListItemText primary={'Logout'} />
                            </ListItemButton>                           
                        </ListItem>


                        

                    </List>
                    <Divider />
                </Box>
            </Drawer>
        </>
    )
}

export default DrawerAtom;