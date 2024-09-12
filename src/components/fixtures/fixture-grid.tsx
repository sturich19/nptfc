import './fixture-grid-styles.css';
import { useEffect, useState } from "react";
import { GetFixtureGrid } from "../../services/fixture-service";
import { FixtureGrid } from "../../objects/fixture-grid";
import { useNavigate } from 'react-router-dom';
import { FormatDate } from '../../utils/formatter-util';


interface FixtureGridProps
{
    seasonId? : string
}

const FixtureGridComponent = (seasonId : FixtureGridProps) =>
{
    const [fixtureGrid, setFixtureGrid] = useState<FixtureGrid[] | null>(null);     
    const navigate = useNavigate();
    
    useEffect(() => {
        GetFixtureGrid(seasonId.seasonId).then(fixtureGrid => setFixtureGrid(fixtureGrid));
    }, [seasonId])

    function handleResultClick(fixtureId : number)
    {
        navigate('/AdminLeagueFixtureUpdate/' + fixtureId);
    }

    return(
        <div >
            <table className="table table-hover table-condensed table-responsive table-bordered table-sm">
                <thead>
                    <tr>
                        <th>Team</th>
                        {
                            fixtureGrid?.map(team => 
                            
                                <th>{team.homeTeamName}</th>
                            )
                        }
                    </tr>
                </thead>
                <tbody className="table-group-divider">                        
                        {
                            fixtureGrid?.map((team, index) => 
                                <tr key={index}>
                                    <td>{team.homeTeamName}</td>
                                    
                                    {team.items.map((fixture, index) =>

                                        fixture.noGame ? 
                                                <td key={index} className="table-secondary"></td> 
                                                :                                                  
                                                (fixture.knownScore ?
                                                    <td key={index} className="table-success" onClick={( ) => handleResultClick(fixture.id)}>
                                                        {fixture.homeTeamScore + ' v ' + fixture.awayTeamScore} ({FormatDate(fixture.date)})
                                                    </td> 
                                                    :
                                                    <td key={index} onClick={( ) => handleResultClick(fixture.id)}>
                                                        {FormatDate(fixture.date)}
                                                    </td>
                                                )            
                                    )}                                  
                                </tr>
                            )
                        }
                </tbody>
            </table>
        </div>
    )
}
export default FixtureGridComponent;