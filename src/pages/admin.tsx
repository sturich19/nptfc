import { useNavigate } from "react-router-dom";
import {
    Box,
    Container,
    Typography,
    Card,
    CardContent,
    CardActions,
    Button,
    Grid,
    Avatar
} from '@mui/material';
import {
    TableChart as TableChartIcon,
    EventNote as EventNoteIcon,
    SportsSoccer as SportsSoccerIcon,
    BarChart as BarChartIcon,
    PersonAdd as PersonAddIcon,
    CalendarMonth as CalendarMonthIcon,
    Group as GroupIcon
} from '@mui/icons-material';

export default function Admin() {
    const navigate = useNavigate();

    const adminCards = [
        {
            title: "Update League Table",
            description: "Correct and update league table standings for teams",
            icon: <TableChartIcon />,
            color: "#1976d2",
            route: "/AdminLeagueTableUpdate"
        },
        {
            title: "Manage Fixtures",
            description: "Create fixtures within a season and update weekend game scores",
            icon: <EventNoteIcon />,
            color: "#388e3c",
            route: "/AdminFixture"
        },
        {
            title: "Add Tigers Result",
            description: "Record match results specifically for Tigers team",
            icon: <SportsSoccerIcon />,
            color: "#f57c00",
            route: "/AdminTigersFixture"
        },
        {
            title: "Player Statistics",
            description: "Add and manage player statistics for fixtures",
            icon: <BarChartIcon />,
            color: "#7b1fa2",
            route: "/AdminGameStats"
        },
        {
            title: "Add Player",
            description: "Register new players to the team roster",
            icon: <PersonAddIcon />,
            color: "#d32f2f",
            route: "/AdminPlayer"
        },
        {
            title: "Manage Season",
            description: "Create and configure new football seasons",
            icon: <CalendarMonthIcon />,
            color: "#303f9f",
            route: "/AdminSeason"
        },
        {
            title: "Team Management",
            description: "Add and manage teams in the database",
            icon: <GroupIcon />,
            color: "#689f38",
            route: "/AdminTeam"
        }
    ];

    return (
        <Container maxWidth="xl" sx={{ py: 2 }}>
            {/* Compact Modern Header */}
            <Box className="d-flex justify-content-between align-items-center mb-3 p-3 bg-light rounded">
                <Box>
                    <Typography variant="h5" component="h1" fontWeight="bold" className="text-success mb-0">
                        Admin Dashboard
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Manage all aspects of the Newport Pagnell Tigers Football Club
                    </Typography>
                </Box>
            </Box>

            <Grid container spacing={2}>
                {adminCards.map((card, index) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                        <Card
                            elevation={1}
                            sx={{
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                transition: 'all 0.2s ease-in-out',
                                '&:hover': {
                                    elevation: 3,
                                    transform: 'translateY(-2px)'
                                }
                            }}
                        >
                            <CardContent sx={{ flexGrow: 1, p: 2 }}>
                                <Box display="flex" alignItems="center" mb={1}>
                                    <Avatar
                                        sx={{
                                            bgcolor: card.color,
                                            mr: 1.5,
                                            width: 32,
                                            height: 32,
                                        }}
                                    >
                                        <Box sx={{ fontSize: '1rem' }}>
                                            {card.icon}
                                        </Box>
                                    </Avatar>
                                    <Typography variant="body1" component="h2" fontWeight="600">
                                        {card.title}
                                    </Typography>
                                </Box>
                                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                                    {card.description}
                                </Typography>
                            </CardContent>
                            <CardActions sx={{ p: 2, pt: 0 }}>
                                <Button
                                    variant="outlined"
                                    fullWidth
                                    size="small"
                                    sx={{
                                        borderColor: card.color,
                                        color: card.color,
                                        fontWeight: 600,
                                        '&:hover': {
                                            bgcolor: card.color,
                                            color: 'white',
                                            borderColor: card.color
                                        }
                                    }}
                                    onClick={() => navigate(card.route)}
                                >
                                    Access
                                </Button>
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
}