import FixtureRow from './fixture-row';
import { Fixture } from '../../objects/fixture';

interface FixtureComponentProps{
    fixtures : Fixture[]
}

const FixtureTable = (fixturesProps : FixtureComponentProps) => {      
  
    return(
        <>                       
        <div className="row">            
            <div>
                <table className="table table-hover table-condensed table-responsive">
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
                        {fixturesProps.fixtures.map(f => <FixtureRow key={f.id} fixture={f} />)}
                    </tbody>
                </table>                          
            </div>
        </div>                
        </>
    );
}
export default FixtureTable;
