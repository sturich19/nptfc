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
import { GetAgeGroups } from "../../services/age-group-service";
import { AgeGroup } from "../../objects/age-group";

const DrawerAtom = () => {

    const [open, setOpen] = useState(false);    
    const [seasons, setSeasons] = useState<Season[] | null>(null);
    const [ageGroups, setAgeGroups] = useState<AgeGroup[] | null>(null);
    const navigate = useNavigate();
    
    useEffect(() => {
        GetAgeGroups().then(ageGroups => setAgeGroups(ageGroups));
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
                        {ageGroups?.map(ageGroup => (
                            <>
                                 <ListSubheader component="div" id="ageGroups-subheader">
                                        {"U" + ageGroup.age + " seasons"}
                                </ListSubheader>

                                <ListItem key={ageGroup.id} disablePadding onClick={() => navigate('/AgeGroup/' + ageGroup.id)}> 
                                    <ListItemButton>
                                        <ListItemIcon><SportsSoccerIcon/></ListItemIcon>
                                        <ListItemText primary={"U" + ageGroup.age + " Overview"} />
                                    </ListItemButton>                           
                                </ListItem>

                                {seasons?.filter(season => season.ageGroup === ageGroup.age).map(season => 
                                    <ListItem key={season.id} disablePadding onClick={() => navigate('/season/' + season.id)}> 
                                        <ListItemButton>
                                            <ListItemIcon><SportsSoccerIcon/></ListItemIcon>
                                            <ListItemText primary={"U" + season.ageGroup + "s Div - " + season.division} />
                                        </ListItemButton>                           
                                    </ListItem>
                                )}
                            </>

                        ))}

                        <ListItem key={"divider"} divider disablePadding/>
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