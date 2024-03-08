import { useNavigate } from 'react-router-dom';
import { Fixture } from '../../objects/fixture';
import { FormatDate } from '../../utils/formatter-util';

interface FixtureItemComponentProps
{
    fixture: Fixture
}

// Here we are passing in the object we want as props and deconstructing it. 
// We do need an Id for each row but that is in the calling code where we are .Map the array
// <ResultsRow key={fixture.Id} {fixture=h}
const FixtureRow = ({fixture} : FixtureItemComponentProps) => {
    
    const navigate = useNavigate();
    function handleResultClick(fixtureId : number)
    {
        navigate('/AdminLeagueFixtureUpdate/' + fixtureId);
    }

    return(  
        
        <tr onClick={( ) => handleResultClick(fixture.id)}>
            <td className='col-1'>{FormatDate(fixture.date)}</td>            
            <td className='col-3'>{fixture.homeTeam}</td>
            <td className='col-1'>{fixture.homeTeamScore}</td>
            <td className='col-1'>V</td>
            <td className='col-1'>{fixture.awayTeamScore}</td>            
            <td className='col-3'>{fixture.awayTeam}</td>                        
        </tr>                
        
    )
}               
export default FixtureRow;