import { AppBar, Container, ThemeProvider, Toolbar, createTheme } from '@mui/material';
import './header.css';
import { green, lightBlue} from '@mui/material/colors';
import HeaderMenuCollapsed from './header-menu-collapsed';
import HeaderMenuLogo from './header-menu-logo';
import HeaderMenuNav from './header-menu-nav';

const theme = createTheme({
    palette: {
      primary: 
      {
        light: '#6b9346',
        main: green[400],
        dark: '#6b9346',
        contrastText: '#6b9346'
      },
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