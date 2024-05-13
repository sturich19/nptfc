import { useNavigate } from 'react-router-dom';
import { LeagueTable } from '../../objects/league-table';
import './league-table-styles.css';

interface LeagueTableRowComponentProps
{
    leagueTableRow : LeagueTable
}

const LeagueTableRow = (leagueTableProps : LeagueTableRowComponentProps) => {
    
    const navigate = useNavigate();
    const handleClick = (leagueTable : LeagueTable) => navigate(`/LeagueResults/${leagueTable.seasonId}/${leagueTable.teamId}`);
    var classesToAdd;

    if (leagueTableProps.leagueTableRow.teamId === 1 || leagueTableProps.leagueTableRow.teamId === 3)
    {
        classesToAdd = ' tigers-highlight' ;
    }

    return(  
        <>
        <tr className={classesToAdd} onClick={() => handleClick(leagueTableProps.leagueTableRow)}>
            <td className='col-3'>{leagueTableProps.leagueTableRow.teamName}</td>
            <td className='col-1'>{leagueTableProps.leagueTableRow.pld}</td>
            <td className='col-1'>{leagueTableProps.leagueTableRow.won}</td>
            <td className='col-1'>{leagueTableProps.leagueTableRow.drawn}</td>
            <td className='col-1'>{leagueTableProps.leagueTableRow.lost}</td>
            <td className='col-1'>{leagueTableProps.leagueTableRow.glsFor}</td>
            <td className='col-1'>{leagueTableProps.leagueTableRow.glsA}</td>
            <td className='col-1'>{leagueTableProps.leagueTableRow.gd}</td>
            <td className='col-1'>{leagueTableProps.leagueTableRow.points}</td>
            {/* <td className='col-1'>{leagueTableProps.leagueTableRow.achieveablePoints}</td>    */}
        </tr>                
        </>   
    )
}               
export default LeagueTableRow;