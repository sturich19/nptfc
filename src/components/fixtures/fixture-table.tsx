import FixtureRow from './fixture-row';
import { Fixture } from '../../objects/fixture';

interface FixtureComponentProps{
    fixtures : Fixture[]
    handleClick : any
}

const FixtureTable = ({fixtures, handleClick} : FixtureComponentProps) => {      
  
    return(
        <>                       
        <div className="row">    
            <div className="col-sm-1 d-none d-sm-block"></div>  
            <div className='col-12 col-sm-10'>
                <table className="table table-hover table-condensed table-responsive table-sm">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Home Team</th>                            
                            <th></th>
                            <th></th>
                            <th></th>
                            <th>Away Team</th>  
                        </tr>
                    </thead>
                    <tbody className='table-group-divider'>     
                        {fixtures.map(f => (
                            <FixtureRow key={f.id} fixture={f} handleClick={handleClick} />                            
                        ))}
                    </tbody>
                </table>                          
            </div>
            <div className="col-sm-1 d-none d-sm-block"></div>  
        </div>                
        </>
    );
}
export default FixtureTable;
