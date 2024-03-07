import { useNavigate } from 'react-router-dom';
import { TigersFixture } from '../../objects/tigers-fixture';
import './tigers-fixtures.css';

interface TigersFixtureItemComponentProps
{
    fixture: TigersFixture
}

// Here we are passing in the object we want as props and deconstructing it. 
// We do need an Id for each row but that is in the calling code where we are .Map the array
// <ResultsRow key={fixture.Id} {fixture=h}
const TigersFixtureRow = ({fixture} : TigersFixtureItemComponentProps) => {
    
    const navigate = useNavigate();
    let resultClassToAdd = "";
    let result = "";   
    var gameType = ""; 

    const handleClick = (fixtureId : any) => navigate('/TigersFixture/' + fixtureId);
    
    switch(fixture.result)
    {
        case 0:
            resultClassToAdd = "table-success col-1";
            result = "W";
            break;
        case 1:            
            resultClassToAdd = "table-danger col-1";
            result = "L";
            break;
        case 2:
            resultClassToAdd = "table-secondary col-1";
            result = "D";
            break;
    }    

    switch(fixture.type)
    {
        case 0:
            gameType = "L";
            break;
        case 1:            
            gameType = "F";
            break;
        case 2:
            gameType = "C";
            break;
    }    
    
    return(  
        
        <tr onClick={() => handleClick(fixture.id)}>
            <td className='col-1'>{new Date(fixture.date).toLocaleDateString("en-UK")}</td>                        
            <td className={resultClassToAdd}>{result}</td>
            <td className='col-3'>{fixture.homeTeam}</td>
            <td className='col-1'>{fixture.homeTeamScore}</td>
            <td className='col-1'>V</td>
            <td className='col-1'>{fixture.awayTeamScore}</td>            
            <td className='col-3'>{fixture.awayTeam}</td>
            <td className='col-1'>{gameType}</td>
        </tr>                
        
    )
}               
export default TigersFixtureRow;