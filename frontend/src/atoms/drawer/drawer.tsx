import { Box, Collapse, Divider, Drawer, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import HomeIcon from '@mui/icons-material/Home';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
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
    const [expandedAgeGroups, setExpandedAgeGroups] = useState<{[key: number]: boolean}>({});
    const [seasonsExpanded, setSeasonsExpanded] = useState(false);
    const navigate = useNavigate();
    
    useEffect(() => {
        GetAgeGroups().then(ageGroups => setAgeGroups(ageGroups));
        GetSeasons().then(seasons => setSeasons(seasons));
    }, []);  

    const toggleDrawer = (newOpen: boolean) => () => {
      setOpen(newOpen);
    };

    const handleAgeGroupClick = (ageGroupId: number, event: React.MouseEvent) => {
        event.stopPropagation();
        setExpandedAgeGroups(prev => ({
            ...prev,
            [ageGroupId]: !prev[ageGroupId]
        }));
    };
   
    return (
        <>
            <IconButton onClick={toggleDrawer(true)} aria-label="Menu"> 
                <MenuIcon/>   
            </IconButton>            
            <Drawer open={open} onClose={toggleDrawer(false)}>
                <Box sx={{ width: 250 }} role="presentation">
                    <List>
                        <ListItem key={"home"} divider disablePadding>
                            <ListItemButton onClick={() => { navigate('/'); setOpen(false); }}>
                                <ListItemIcon><HomeIcon/></ListItemIcon>
                                <ListItemText primary={'Home'} />
                            </ListItemButton>
                        </ListItem>

                        {/* Seasons - Top Level */}
                        <ListItem divider disablePadding>
                            <ListItemButton onClick={(e) => { e.stopPropagation(); setSeasonsExpanded(!seasonsExpanded); }}>
                                <ListItemIcon><SportsSoccerIcon/></ListItemIcon>
                                <ListItemText primary={'Seasons'} />
                                {seasonsExpanded ? <ExpandLess /> : <ExpandMore />}
                            </ListItemButton>
                        </ListItem>

                        {/* Age Groups under Seasons */}
                        <Collapse in={seasonsExpanded} timeout="auto" unmountOnExit>
                            {ageGroups?.map(ageGroup => (
                                <div key={ageGroup.id}>
                                    <ListItem disablePadding sx={{ pl: 4 }}>
                                        <ListItemButton onClick={(e) => handleAgeGroupClick(ageGroup.id, e)}>
                                            <ListItemText primary={"U" + ageGroup.age + " Seasons"} />
                                            {expandedAgeGroups[ageGroup.id] ? <ExpandLess /> : <ExpandMore />}
                                        </ListItemButton>
                                    </ListItem>

                                    <Collapse in={expandedAgeGroups[ageGroup.id]} timeout="auto" unmountOnExit>
                                        <List component="div" disablePadding>
                                            <ListItem disablePadding sx={{ pl: 8 }}>
                                                <ListItemButton onClick={() => { navigate('/AgeGroup/' + ageGroup.id); setOpen(false); }}>
                                                    <ListItemText primary={"Overview"} />
                                                </ListItemButton>
                                            </ListItem>

                                            {seasons?.filter(season => season.ageGroup === ageGroup.age).map(season =>
                                                <ListItem key={season.id} disablePadding sx={{ pl: 8 }}>
                                                    <ListItemButton onClick={() => { navigate('/season/' + season.id); setOpen(false); }}>
                                                        <ListItemText primary={"Division " + season.division} />
                                                    </ListItemButton>
                                                </ListItem>
                                            )}
                                        </List>
                                    </Collapse>
                                </div>
                            ))}
                        </Collapse>

                        <ListItem key={"divider"} divider disablePadding/>
                        <ListItem key={"players"} divider disablePadding>
                            <ListItemButton onClick={() => { navigate('/Players'); setOpen(false); }}>
                                <ListItemIcon><DirectionsRunIcon/></ListItemIcon>
                                <ListItemText primary={'Players'} />
                            </ListItemButton>
                        </ListItem>

                        <ListItem key={"admin"} divider disablePadding>
                            <ListItemButton onClick={() => { navigate('/Admin'); setOpen(false); }}>
                                <ListItemIcon><AdminIcon/></ListItemIcon>
                                <ListItemText primary={'Admin'} />
                            </ListItemButton>
                        </ListItem>

                        <ListItem key={"signout"} divider disablePadding>
                            <ListItemButton onClick={() => { navigate('/Logout'); setOpen(false); }}>
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