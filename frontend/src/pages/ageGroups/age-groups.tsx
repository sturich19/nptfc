import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { AgeGroup } from '../../objects/age-group';
import { GetAgeGroups } from '../../services/age-group-service';
import AgeGroupCard from '../../atoms/card/age-group-card';

const AgeGroups = () => {
    
    const navigate = useNavigate();    
    const [ageGroups, setAgeGroups] = useState<AgeGroup[] | null>(null);
    
    useEffect(() => {
        GetAgeGroups().then(ageGroups => setAgeGroups(ageGroups));
    }, []);   

    const handleClick = (ageGroupId : any) => navigate('/AgeGroup/' + ageGroupId);

    return(
        <>
            <div className="container-fluid">
                <div className="row">       
                {   ageGroups ? ageGroups.map((item) => ( 
                            <AgeGroupCard key={item.id} ageGroup={item} handleClick={handleClick} > </AgeGroupCard>                            
                        )) : <p>Loading Age Groups...</p>}
                </div>        
            </div>
        </>
    )
}
export default AgeGroups;