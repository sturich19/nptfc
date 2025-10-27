import { useState, useEffect, useMemo } from "react";
import { GameStat } from "../../objects/game-stat";
interface GameStatComponentProps {
  gameStats: GameStat[];
}

const GameStatTable = (gameStatProps: GameStatComponentProps) => {
  const [sort, setSort] = useState(0);

  // Sort by goals on initial load
  useEffect(() => {
    gameStatProps.gameStats.sort((a, b) => b.goals - a.goals);
    setSort(1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Calculate totals for all numeric columns
  const statTotals = useMemo(() => {
    return gameStatProps.gameStats.reduce(
      (totals, stat) => ({
        apps: totals.apps + stat.apps,
        goals: totals.goals + stat.goals,
        goalsLeft: totals.goalsLeft + stat.goalsLeft,
        goalsRight: totals.goalsRight + stat.goalsRight,
        goalsOther: totals.goalsOther + stat.goalsOther,
        assists: totals.assists + stat.assists,
        shots: totals.shots + stat.shots,
        shotsLeft: totals.shotsLeft + stat.shotsLeft,
        shotsRight: totals.shotsRight + stat.shotsRight,
        shotsOnTarget: totals.shotsOnTarget + stat.shotsOnTarget,
        shotsOffTarget: totals.shotsOffTarget + stat.shotsOffTarget,
        cleanSheets: totals.cleanSheets + stat.cleanSheets,
        saves: totals.saves + stat.saves,
      }),
      {
        apps: 0,
        goals: 0,
        goalsLeft: 0,
        goalsRight: 0,
        goalsOther: 0,
        assists: 0,
        shots: 0,
        shotsLeft: 0,
        shotsRight: 0,
        shotsOnTarget: 0,
        shotsOffTarget: 0,
        cleanSheets: 0,
        saves: 0,
      },
    );
  }, [gameStatProps.gameStats]);

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
                    <td>{f.shots}</td>
                    <td>{f.shotsLeft}</td>
                    <td>{f.shotsRight}</td>
                    <td>{f.shotsOnTarget}</td>
                    <td>{f.shotsOffTarget}</td>
                    <td className="d-none d-sm-table-cell">{f.cleanSheets}</td>
                    <td>{f.saves}</td>
                  </tr>
                </>
              ))}
              {/* Total Row */}
              <tr className="table-secondary fw-bold">
                <td>TOTAL</td>
                <td>{statTotals.apps}</td>
                <td>{statTotals.goals}</td>
                <td className="d-none d-sm-table-cell">{statTotals.goalsLeft}</td>
                <td className="d-none d-sm-table-cell">{statTotals.goalsRight}</td>
                <td>{statTotals.goalsOther}</td>
                <td>{statTotals.assists}</td>
                <td>{statTotals.shots}</td>
                <td>{statTotals.shotsLeft}</td>
                <td>{statTotals.shotsRight}</td>
                <td>{statTotals.shotsOnTarget}</td>
                <td>{statTotals.shotsOffTarget}</td>
                <td className="d-none d-sm-table-cell">{statTotals.cleanSheets}</td>
                <td>{statTotals.saves}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};
export default GameStatTable;
