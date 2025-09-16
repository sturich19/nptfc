import { useEffect, useState } from "react";
import { GetFixturesForDate, GetFixturesForSeason } from "../../services/fixture-service";
import { Fixture } from "../../objects/fixture";
import { FormatDateYYYYMMDD } from "../../utils/formatter-util";
import { GetClosestSaturday } from "../../utils/date-utils";
import FixtureTable from "./fixture-table";
import { ArrowBack, ArrowForward, ArrowRightAlt } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

interface FixtureListProps
{
    seasonId? : string
    date : Date
}

const FixtureList = (fixtureListProps : FixtureListProps) => {    

    const [fixtures, setFixtures] = useState<Fixture[] | null>(null);        
    //const [currentFixturesDate, setFixturesDate] = useState(GetClosestSaturday(fixtureListProps.date));  
    
    useEffect(() => {
        //GetFixturesForDate(fixtureListProps.seasonId, FormatDateYYYYMMDD(currentFixturesDate)).then(fixtures => setFixtures(fixtures));
        GetFixturesForSeason(fixtureListProps.seasonId).then(fixtures => setFixtures(fixtures));
        //setFixturesDate(currentFixturesDate);
     }, []);  

     const navigate = useNavigate();
     function handleResultClick(fixtureId : number)
     {         
         navigate(`/LeagueFixtureHistory/${fixtureListProps.seasonId}/${fixtureId}`);
     }

    //  function handlePreviousClick()
    //  {
    //     const newDate = currentFixturesDate;
    //     newDate.setDate(newDate.getDate() - 7);                
    //     GetFixturesForDate(fixtureListProps.seasonId, FormatDateYYYYMMDD(newDate)).then(fixtures => setFixtures(fixtures));        
    //  }

    //  function handleNextClick()
    //  {
    //     const newDate = currentFixturesDate;
    //     newDate.setDate(newDate.getDate() + 7);                
    //     GetFixturesForDate(fixtureListProps.seasonId, FormatDateYYYYMMDD(newDate)).then(fixtures => setFixtures(fixtures));   
    //  }
    
    // Group fixtures by date
    const groupFixturesByDate = (fixtures: Fixture[]) => {
        const grouped: { [key: string]: Fixture[] } = {};

        fixtures.forEach(fixture => {
            const dateKey = new Date(fixture.date).toDateString();
            if (!grouped[dateKey]) {
                grouped[dateKey] = [];
            }
            grouped[dateKey].push(fixture);
        });

        // Sort dates chronologically
        return Object.keys(grouped)
            .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
            .map(dateKey => ({
                date: dateKey,
                fixtures: grouped[dateKey]
            }));
    };

    const formatDateHeader = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            weekday: 'long',
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    return(
        <>
            <div className="row">
                <div className="col-12">
                     {fixtures ? (
                        <div>
                            {groupFixturesByDate(fixtures).map((group, index) => (
                                <div key={group.date} className="mb-3">
                                    {index > 0 && <div className="mb-2"></div>}
                                    <div className="d-flex align-items-center my-2 px-3">
                                        <small className="text-success fw-semibold me-3" style={{fontSize: '0.9rem'}}>
                                            {formatDateHeader(group.date)}
                                        </small>
                                        <div className="flex-grow-1" style={{height: '1px', backgroundColor: '#28a745'}}></div>
                                    </div>
                                    <FixtureTable fixtures={group.fixtures} handleClick={handleResultClick} />
                                </div>
                            ))}
                        </div>
                     ) : (
                        <div></div>
                     )}
                </div>
            </div>
        </>
    )
}

export default FixtureList;