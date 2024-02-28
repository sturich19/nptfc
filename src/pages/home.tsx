import { useEffect, useState } from 'react';
import { GetSeasons } from "../services/season-service";
import { Season } from "../objects/season";
import SeasonCard from "../atoms/card/season-card";
import { useNavigate } from "react-router-dom";

const Home = () => {
    
    const navigate = useNavigate();
    const [seasons, setData] = useState<Season[] | null>(null);
    
    useEffect(() => {
        GetSeasons().then(seasons => setData(seasons));
    }, []);   

    const handleClick = (seasonId : any) => navigate('/Season/' + seasonId);

    return(
        <>
            <div className="container-fluid">
                <div className="row">                    
                    {   seasons ? seasons.map((item) => ( 
                            <SeasonCard key={item.id} season={item} handleClick={handleClick} > </SeasonCard>                            
                        )) : <p>Loading Seasons...</p>}
                        
                </div>        
            </div>
        </>
    )
}
export default Home;