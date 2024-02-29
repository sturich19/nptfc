import { AppBar, Container, ThemeProvider, Toolbar, createTheme } from '@mui/material';
import './header.css';
import { green, lightBlue } from '@mui/material/colors';
import HeaderMenuCollapsed from './header-menu-collapsed';
import HeaderMenuLogo from './header-menu-logo';
import HeaderMenuNav from './header-menu-nav';

const theme = createTheme({
    palette: {
      primary: green,
      secondary: lightBlue,
    },
  });

const Header = () => { 
    
    return(        
        <ThemeProvider theme={theme}>
            <AppBar position="static">
                <Container>
                <Toolbar >  
                    <HeaderMenuCollapsed/>
                    <HeaderMenuLogo/>
                    <HeaderMenuNav/>                  
                </Toolbar>
                </Container>
        </AppBar>    
      </ThemeProvider>
    );
}
export default Header;