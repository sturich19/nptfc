import { useNavigate } from 'react-router-dom';
import { TigersFixture } from '../../objects/tigers-fixture';
import './tigers-fixtures.css';
import { FormatDate } from '../../utils/formatter-util';

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
            resultClassToAdd = "table-success";
            result = "W";
            break;
        case 1:            
            resultClassToAdd = "table-danger";
            result = "L";
            break;
        case 2:
            resultClassToAdd = "table-secondary";
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
            <td >{FormatDate(fixture.date)}</td>                        
            <td className={resultClassToAdd}>{result}</td>
            <td >{fixture.homeTeam}</td>
            <td >{fixture.homeTeamScore}</td>
            <td >V</td>
            <td >{fixture.awayTeamScore}</td>            
            <td >{fixture.awayTeam}</td>
            <td >{gameType}</td>
        </tr>                
        
    )
}               
export default TigersFixtureRow;