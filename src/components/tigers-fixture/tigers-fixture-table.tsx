import TigersFixtureRow from './tigers-fixture-row';
import { TigersFixture } from '../../objects/tigers-fixture';
import { GameType } from '../../objects/enums/enums';

interface TigersFixtureComponentProps{
    fixtures : TigersFixture[],
    gameType : GameType
}

// You have to pass in the props and say that props evaluates to fixturesToShow which is of type Fixture[]
const TigersFixtureTable = (fixturesProps : TigersFixtureComponentProps) => {      

    // useState is a hook. Must be first line of the function. 
    // useState(xxx) - xxx is the original collection
    // [fixtures,...] - fixtures is the current copy of it. This will get updated by using setFixture
    // [..., setFixture] - is a function used to update the fixtures array.
   // const [fixtures, setFixture] = useState(fixturesToShow);      
    return(
        <>                       
        <div className="row">            
            <div>
                <table className="table table-hover table-condensed table-responsive">
                    <thead>
                        <tr>
                            <th>Date</th>                            
                            <th></th>
                            <th>Home</th>                            
                            <th></th>
                            <th></th>
                            <th></th>
                            <th>Away</th>  
                            <th>Type</th>
                        </tr>
                    </thead>
                    <tbody className='table-group-divider'>     
                        {fixturesProps.gameType === GameType.Any ? 
                            fixturesProps.fixtures.map(f => <TigersFixtureRow key={f.id} fixture={f} />) : fixturesProps.fixtures.filter(fixture => fixture.type === fixturesProps.gameType).map(f => <TigersFixtureRow key={f.id} fixture={f} />)}
                    </tbody>
                </table>                          
            </div>
        </div>                
        </>
    );
}
export default TigersFixtureTable;


 // function we are using to add a fixture. 
    // const addFixture = () =>
    // {
    //     // // Using the setFixture function, pass in the current fixtures (deconstructing it here)
    //     // // this will create a new array with whats in fixtures, then it will add what comes next
    //     // setFixture([
    //     //     ...fixtures,
    //     //     {
    //     //         id: 1,
    //     //         date: "9th September",
    //     //         result: "W",
    //     //         homeTeam: "Walton MK Kestrels",
    //     //         awayTeam: "Tigers",
    //     //         homeScore: 0,
    //     //         awayScore: 8,
    //     //         fixture: "League"
    //     //     },
    //     // ]);
    // }