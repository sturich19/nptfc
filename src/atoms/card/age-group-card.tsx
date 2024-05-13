import { GetAgeGroupImageToUse } from '../../utils/season-utils';
import './season-card-styles.css';

const AgeGroupCard = ({ageGroup, handleClick} : any) => {     

    var altText = 'U' + ageGroup.age + 's - ' + ageGroup.startYear + " - " + ageGroup.endYear;

    return(   
        <div className="col-sm-4 col-6 col-md-4 col-lg-4 col-xl-2  season-card" onClick={() => handleClick(ageGroup.id)}>            
            <img src={GetAgeGroupImageToUse(ageGroup)} alt={altText} />
        </div>        
    )
}
export default AgeGroupCard;