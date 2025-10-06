import { Fixture } from "../../objects/fixture";

// Here we are passing in the object we want as props and deconstructing it.
// We do need an Id for each row but that is in the calling code where we are .Map the array
// <ResultsRow key={fixture.Id} {fixture=h}
const FixtureRow = ({ fixture, handleClick }: any) => {
  const fixtureStyleToAdd =
    fixture.homeTeamId === 1 || fixture.awayTeamId === 1 ? "table-success" : "";

  // Format the date to show day, month and year
  const formattedDate = fixture.date
    ? new Date(fixture.date).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        weekday: "short",
      })
    : "";

  return (
    <tr className={fixtureStyleToAdd} onClick={() => handleClick(fixture.id)}>
      <td className="col-2">{formattedDate}</td>
      <td className="col-3">{fixture.homeTeam}</td>
      <td className="col-1">{fixture.homeTeamScore}</td>
      <td className="col-1">V</td>
      <td className="col-1">{fixture.awayTeamScore}</td>
      <td className="col-3">{fixture.awayTeam}</td>
    </tr>
  );
};
export default FixtureRow;
