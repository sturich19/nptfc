import Box from '@mui/material/Box';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import './sidebar-styles.css';
import { useState } from 'react';

const SeasonSidebar = ({handleClick} : any) => {

    const [selectedIndex, setSelectedIndex] = useState(0);

    const handleListItemClick = (
        event: React.MouseEvent<HTMLDivElement, MouseEvent>,
        index: number,
      ) => {
        setSelectedIndex(index);
        handleClick(index);
      };

    return(
        <>
         <Divider></Divider>
         <Box
            sx={{ width: 150}}
            role="presentation"            
            >
            <List>                
                <ListItem >
                    <ListItemButton selected={selectedIndex === 0} onClick={(event => handleListItemClick(event, 0))}>
                        <ListItemText primary={"League"}/>
                    </ListItemButton>
                </ListItem>                
                <ListItem >
                    <ListItemButton selected={selectedIndex === 1} onClick={(event => handleListItemClick(event, 1))}>
                        <ListItemText primary={"Stats"}/>
                    </ListItemButton>
                </ListItem>
                <ListItem >
                    <ListItemButton selected={selectedIndex === 2} onClick={(event => handleListItemClick(event, 2))}>
                        <ListItemText primary={"Grid"}/>
                    </ListItemButton>
                </ListItem>
                <ListItem >
                    <ListItemButton selected={selectedIndex === 3} onClick={(event => handleListItemClick(event, 3))}>
                        <ListItemText primary={"Fantasy"}/>
                    </ListItemButton>
                </ListItem>
            </List>
            <Divider />
            <List>
                
            </List>
            </Box>
        
        </>
    )
}

export default SeasonSidebar;