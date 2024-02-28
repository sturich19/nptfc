import TigersFixtureRow from './tigers-fixture-row';
import { TigersFixture } from '../../objects/tigers-fixture';

interface TigersFixtureComponentProps{
    fixture : TigersFixture    
}
const SingleTigersFixtureTable = (fixturesProps : TigersFixtureComponentProps) => {      

    return(
        <>                       
        <div className="row">            
            <div>
                <table className="table table-hover table-condensed table-responsive">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Type</th>
                            <th>Result</th>
                            <th>Home Team</th>
                            <th></th>                                                                                                 
                            <th></th>  
                            <th></th>  
                            <th>Away Team</th>  
                        </tr>
                    </thead>
                    <tbody>                        
                        <TigersFixtureRow key={fixturesProps.fixture.id} fixture={fixturesProps.fixture} />
                    </tbody>
                </table>                          
            </div>
        </div>                
        </>
    );
}
export default SingleTigersFixtureTable;