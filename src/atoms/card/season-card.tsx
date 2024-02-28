import './season-card-styles.css';
const SeasonCard = ({season, handleClick} : any) => {     

    return(   
        <div className="col-sm-3">
            <div className="card">
                <div className="card-body">
                    <h5 className="card-title">U{season.ageGroup}s - {season.startYear}</h5>
                    <p className="card-title">{season.monthStart} {'->'} {season.monthEnd}</p>
                    <p className="card-text">Division: {season.division}</p>                    
                    <button className="btn btn-primary" onClick={()=> handleClick(season.id)}>View</button>                        
                </div>
            </div>
        </div>        
    )
}
export default SeasonCard;