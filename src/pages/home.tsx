import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { AgeGroup } from '../objects/age-group';
import { GetAgeGroup } from '../services/age-group-service';

const Home = () => {
    
    const navigate = useNavigate();    
    const [ageGroup, setAgeGroup] = useState<AgeGroup | null>(null);
    
    useEffect(() => {
        GetAgeGroup()
            .then(ageGroup => 
            {
                setAgeGroup(ageGroup)
                navigate('/AgeGroup/' + ageGroup.id)
            }
        );        
    }, []);   

    return(
        <>
            <div className="container-fluid">
                <div className="row">       
                    <p>Loading Age Group...</p>
                </div>        
            </div>
        </>
    )
}
export default Home;