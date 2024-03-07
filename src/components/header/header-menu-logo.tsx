import { Typography } from "@mui/material";
import TitleIcon from '@mui/icons-material/SportsSoccerTwoTone';

const HeaderMenuLogo = () => {

    const title = "Tigers";
    return (
        <>
            {/* This is seen when display > xs  */}
            <TitleIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1, color: 'white' }} />
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
            <TitleIcon sx={{ display: { xs: 'flex', md: 'none' }, mr: 1, color: 'white' }} />
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
