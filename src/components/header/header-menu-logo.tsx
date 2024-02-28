import { Typography } from "@mui/material";
import MenuIcon from '@mui/icons-material/Adb';

const HeaderMenuLogo = () => {

    const title = "NPTFC";
    return (
        <>
            {/* This is seen when display > xs  */}
            <Typography variant="h6" noWrap component="a" href="/Home"
                sx={{
                    mr: 2,
                    display: { xs: 'none', md: 'flex' },
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    letterSpacing: '.3rem',
                    color: 'white',
                    textDecoration: 'none',
                }}
            >
            {title}
            </Typography>

            {/* This is seen when display < md  */}
            <MenuIcon sx={{ display: { xs: 'flex', md: 'none' }, mr: 1, color: 'white' }} />
            <Typography variant="h5" noWrap component="a" href="/Home"
                sx={{
                    mr: 2,
                    display: { xs: 'flex', md: 'none' },
                    flexGrow: 1,
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    letterSpacing: '.3rem',
                    color: 'white',
                    textDecoration: 'none',
                }}
                >
             {title}
            </Typography>
        </>
    )

}

export default HeaderMenuLogo;
