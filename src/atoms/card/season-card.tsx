import { GetImageToUse } from '../../utils/season-utils';
import './season-card-styles.css';

const SeasonCard = ({season, handleClick} : any) => {     

    var altText = 'U' + season.ageGroup + 's - ' + season.startYear;

    return(   
        <div className="col-sm-4 col-6 col-md-4 col-lg-4 col-xl-2  season-card" onClick={() => handleClick(season.id)}>            
            <img src={GetImageToUse(season)} alt={altText} />
        </div>        
    )
}
export default SeasonCard;