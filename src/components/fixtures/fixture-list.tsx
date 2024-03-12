import { useEffect, useState } from "react";
import { GetFixturesForDate } from "../../services/fixture-service";
import { Fixture } from "../../objects/fixture";
import { FormatDateYYYYMMDD } from "../../utils/formatter-util";
import { GetClosestSaturday } from "../../utils/date-utils";
import FixtureTable from "./fixture-table";
import { ArrowBack, ArrowForward, ArrowRightAlt } from "@mui/icons-material";

interface FixtureListProps
{
    seasonId? : string
    date : Date
}

const FixtureList = (fixtureListProps : FixtureListProps) => {    

    const [fixtures, setFixtures] = useState<Fixture[] | null>(null);        
    const [currentFixturesDate, setFixturesDate] = useState(GetClosestSaturday(fixtureListProps.date));  
    
    useEffect(() => {
        GetFixturesForDate(fixtureListProps.seasonId, FormatDateYYYYMMDD(currentFixturesDate)).then(fixtures => setFixtures(fixtures));
        setFixturesDate(currentFixturesDate);
     }, []);  

     function handlePreviousClick()
     {
        const newDate = currentFixturesDate;
        newDate.setDate(newDate.getDate() - 7);                
        GetFixturesForDate(fixtureListProps.seasonId, FormatDateYYYYMMDD(newDate)).then(fixtures => setFixtures(fixtures));        
     }

     function handleNextClick()
     {
        const newDate = currentFixturesDate;
        newDate.setDate(newDate.getDate() + 7);                
        GetFixturesForDate(fixtureListProps.seasonId, FormatDateYYYYMMDD(newDate)).then(fixtures => setFixtures(fixtures));   
     }
    
    return(   
        <>
            <div className="row"> 
                <div className="col-1">
                    <ArrowBack onClick={() => handlePreviousClick()}></ArrowBack>                    
                </div>
                <div className="col-10">
                     {fixtures ? 
                        <FixtureTable fixtures={fixtures}></FixtureTable> 
                        :
                        <div></div>
                     }
                </div>
                <div className="col-1">
                <ArrowForward onClick={() => handleNextClick()}></ArrowForward>                
                </div>
            </div>            
        </>              
    )
}

export default FixtureList;