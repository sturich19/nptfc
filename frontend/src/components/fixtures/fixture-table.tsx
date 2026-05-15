import FixtureRow from "./fixture-row";
import { Fixture } from "../../objects/fixture";

interface FixtureComponentProps {
  fixtures: Fixture[];
  handleClick: any;
}

const FixtureTable = ({ fixtures, handleClick }: FixtureComponentProps) => {
  return (
    <table
      className="table table-hover table-condensed table-responsive table-sm"
    >
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
      <tbody className="table-group-divider">
        {fixtures
          .sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
          )
          .map((f) => (
            <FixtureRow key={f.id} fixture={f} handleClick={handleClick} />
          ))}
      </tbody>
    </table>
  );
};
export default FixtureTable;
