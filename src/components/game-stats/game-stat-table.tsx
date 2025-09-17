import { useState } from "react";
import { GameStat } from "../../objects/game-stat";
interface GameStatComponentProps {
  gameStats: GameStat[];
}

const GameStatTable = (gameStatProps: GameStatComponentProps) => {
  const [sort, setSort] = useState(0);

  function Sort(name: string) {
    switch (name) {
      case "pld":
        gameStatProps.gameStats.sort((a, b) => b.apps - a.apps);
        break;

      case "gls":
        gameStatProps.gameStats.sort((a, b) => b.goals - a.goals);
        break;

      case "glsL":
        gameStatProps.gameStats.sort((a, b) => b.goalsLeft - a.goalsLeft);
        break;

      case "glsR":
        gameStatProps.gameStats.sort((a, b) => b.goalsRight - a.goalsRight);
        break;

      case "glsO":
        gameStatProps.gameStats.sort((a, b) => b.goalsOther - a.goalsOther);
        break;

      case "ass":
        gameStatProps.gameStats.sort((a, b) => b.assists - a.assists);
        break;

      case "gso":
        gameStatProps.gameStats.sort((a, b) => b.gso - a.gso);
        break;

      case "shots":
        gameStatProps.gameStats.sort((a, b) => b.shots - a.shots);
        break;

      case "shotsL":
        gameStatProps.gameStats.sort((a, b) => b.shotsLeft - a.shotsLeft);
        break;

      case "shotsR":
        gameStatProps.gameStats.sort((a, b) => b.shotsRight - a.shotsRight);
        break;

      case "shotsOn":
        gameStatProps.gameStats.sort(
          (a, b) => b.shotsOnTarget - a.shotsOnTarget,
        );
        break;

      case "shotsOff":
        gameStatProps.gameStats.sort(
          (a, b) => b.shotsOffTarget - a.shotsOffTarget,
        );
        break;

      case "saves":
        gameStatProps.gameStats.sort((a, b) => b.saves - a.saves);
        break;

      case "cs":
        gameStatProps.gameStats.sort((a, b) => b.cleanSheets - a.cleanSheets);
        break;

      case "pens":
        gameStatProps.gameStats.sort((a, b) => b.penSaves - a.penSaves);
        break;
    }
    setSort(sort + 1);
  }
  return (
    <>
      <div className="row">
        <div>
          <table className="table table-hover table-condensed table-responsive table-sm">
            <thead className="thead-light">
              <tr>
                <th>Player</th>
                <th
                  scope="col"
                  className="sortable"
                  onClick={() => Sort("pld")}
                >
                  Pld
                </th>
                <th
                  scope="col"
                  className="sortable"
                  onClick={() => Sort("gls")}
                >
                  Gls
                </th>
                <th
                  scope="col"
                  className="sortable d-none d-sm-table-cell"
                  onClick={() => Sort("glsL")}
                >
                  Gls L
                </th>
                <th
                  scope="col"
                  className="sortable d-none d-sm-table-cell"
                  onClick={() => Sort("glsR")}
                >
                  Gls R
                </th>
                <th
                  scope="col"
                  className="sortable"
                  onClick={() => Sort("glsO")}
                >
                  Gls O
                </th>
                <th
                  scope="col"
                  className="sortable"
                  onClick={() => Sort("ass")}
                >
                  Ass
                </th>
                <th
                  scope="col"
                  className="sortable d-none d-sm-table-cell"
                  onClick={() => Sort("gso")}
                >
                  GSOs
                </th>
                <th
                  scope="col"
                  className="sortable"
                  onClick={() => Sort("shots")}
                >
                  Shots
                </th>
                <th
                  scope="col"
                  className="sortable"
                  onClick={() => Sort("shotsL")}
                >
                  Shots L
                </th>
                <th
                  scope="col"
                  className="sortable"
                  onClick={() => Sort("shotsR")}
                >
                  Shots R
                </th>
                <th
                  scope="col"
                  className="sortable"
                  onClick={() => Sort("shotsOn")}
                >
                  On
                </th>
                <th
                  scope="col"
                  className="sortable"
                  onClick={() => Sort("shotsOff")}
                >
                  Off
                </th>
                <th
                  scope="col"
                  className="sortable d-none d-sm-table-cell"
                  onClick={() => Sort("cs")}
                >
                  CS
                </th>
                <th
                  scope="col"
                  className="sortable"
                  onClick={() => Sort("saves")}
                >
                  Saves
                </th>
                <th
                  scope="col"
                  className="sortable d-none d-sm-table-cell"
                  onClick={() => Sort("penSaves")}
                >
                  Pens
                </th>
              </tr>
            </thead>
            <tbody className="table-group-divider">
              {gameStatProps.gameStats.map((f) => (
                <>
                  <tr key={f.id}>
                    <td>{f.playerName}</td>
                    <td>{f.apps}</td>
                    <td>{f.goals}</td>
                    <td className="d-none d-sm-table-cell">{f.goalsLeft}</td>
                    <td className="d-none d-sm-table-cell">{f.goalsRight}</td>
                    <td>{f.goalsOther}</td>
                    <td>{f.assists}</td>
                    <td className="d-none d-sm-table-cell">{f.gso}</td>
                    <td>{f.shots}</td>
                    <td>{f.shotsLeft}</td>
                    <td>{f.shotsRight}</td>
                    <td>{f.shotsOnTarget}</td>
                    <td>{f.shotsOffTarget}</td>
                    <td className="d-none d-sm-table-cell">{f.cleanSheets}</td>
                    <td>{f.saves}</td>
                    <td className="d-none d-sm-table-cell">{f.penSaves}</td>
                  </tr>
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};
export default GameStatTable;
