import { useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { Season } from '../objects/season';
import { GetSeasons } from '../services/season-service';

const Home = () => {

    const navigate = useNavigate();

    useEffect(() => {
        const redirectToLatestSeason = async () => {
            try {
                const seasons = await GetSeasons();
                if (seasons && seasons.length > 0) {
                    // Find the most recent active season, or fall back to the latest season
                    const activeSeason = seasons.find((season: Season) => season.active);
                    const latestSeason = activeSeason || seasons.sort((a: Season, b: Season) => b.startYear - a.startYear)[0];

                    // Redirect to the season overview page
                    navigate('/season/' + latestSeason.id);
                } else {
                    // Fallback to first available age group if no seasons exist
                    navigate('/AgeGroup/1');
                }
            } catch (error) {
                console.error("Error loading seasons:", error);
                // Fallback to first available age group on error
                navigate('/AgeGroup/1');
            }
        };

        redirectToLatestSeason();
    }, [navigate]);

    return(
        <>
            <div className="container-fluid">
                <div className="row">
                    <p>Loading latest season...</p>
                </div>
            </div>
        </>
    )
}
export default Home;