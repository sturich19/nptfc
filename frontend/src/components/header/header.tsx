import { AppBar, Container, ThemeProvider, Toolbar, createTheme } from '@mui/material';
import './header.css';
import { green, lightBlue} from '@mui/material/colors';
import HeaderMenuLogo from './header-menu-logo';
import DrawerAtom from '../../atoms/drawer/drawer';

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
                      <DrawerAtom/>
                      <HeaderMenuLogo/>    
                  </Toolbar>
                </Container>
        </AppBar>    
      </ThemeProvider>
    );
}
export default Header;