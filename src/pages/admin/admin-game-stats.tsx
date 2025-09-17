import { useNavigate } from "react-router-dom";
import { Season } from "../../objects/season";
import { useEffect, useState } from "react";
import { GetSeasons } from "../../services/season-service";
import { TigersFixture } from "../../objects/tigers-fixture";
import { GetTigersFixtures } from "../../services/tigers-fixture-service";
import { Player } from "../../objects/player";
import { GetPlayers } from "../../services/player-service";
import { GameStat } from "../../objects/game-stat";
import {
  PostGameStatsBulk,
  GetFixtureGameStats,
} from "../../services/game-stat-service";
import { FormatDate } from "../../utils/formatter-util";

interface PlayerStats {
  playerId: number;
  playerName: string;
  goals: number;
  goalsLeft: number;
  goalsRight: number;
  goalsOther: number;
  assists: number;
  gso: number;
  shots: number;
  shotsOnTarget: number;
  shotsOffTarget: number;
  shotsLeft: number;
  shotsRight: number;
  cleanSheets: number;
  saves: number;
  penSaves: number;
}

const AdminGameStats = () => {
  const [seasons, setSeasons] = useState<Season[]>();
  const [fixtures, setFixtures] = useState<TigersFixture[]>();
  const [players, setPlayers] = useState<Player[]>();
  const [selectedSeason, setSelectedSeason] = useState<number>(0);
  const [selectedFixture, setSelectedFixture] = useState<number>(0);
  const [playerStats, setPlayerStats] = useState<PlayerStats[]>([]);
  const [existingStats, setExistingStats] = useState<GameStat[]>([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    GetSeasons().then((data) => {
      setSeasons(data);
      const activeSeason = data.find((season: Season) => season.active);
      if (activeSeason) {
        setSelectedSeason(activeSeason.id);
      }
    });
    GetPlayers().then((data) => setPlayers(data));
  }, []);

  useEffect(() => {
    if (selectedSeason > 0) {
      GetTigersFixtures().then((data) => {
        const seasonFixtures = data.filter(
          (f: TigersFixture) => f.seasonId === selectedSeason,
        );
        setFixtures(seasonFixtures);
      });
    }
  }, [selectedSeason]);

  useEffect(() => {
    if (selectedFixture > 0 && players) {
      // Get existing stats for this fixture
      GetFixtureGameStats(selectedFixture).then((stats) => {
        setExistingStats(stats || []);

        // Initialize player stats array with all players
        const initialStats = players.map((player) => {
          const existing = stats?.find(
            (s: GameStat) => s.playerId === player.id,
          );
          return {
            playerId: player.id,
            playerName: `${player.firstname} ${player.surname}`,
            goals: existing?.goals || 0,
            goalsLeft: existing?.goalsLeft || 0,
            goalsRight: existing?.goalsRight || 0,
            goalsOther: existing?.goalsOther || 0,
            assists: existing?.assists || 0,
            gso: existing?.gso || 0,
            shots: existing?.shots || 0,
            shotsOnTarget: existing?.shotsOnTarget || 0,
            shotsOffTarget: existing?.shotsOffTarget || 0,
            shotsLeft: existing?.shotsLeft || 0,
            shotsRight: existing?.shotsRight || 0,
            cleanSheets: existing?.cleanSheets || 0,
            saves: existing?.saves || 0,
            penSaves: existing?.penSaves || 0,
          };
        });
        setPlayerStats(initialStats);
      });
    }
  }, [selectedFixture, players]);

  const handleStatChange = (
    playerId: number,
    field: keyof PlayerStats,
    value: number,
  ) => {
    setPlayerStats((prev) =>
      prev.map((stat) =>
        stat.playerId === playerId ? { ...stat, [field]: value } : stat,
      ),
    );
  };

  const handleSaveAll = async () => {
    if (!selectedSeason || !selectedFixture) {
      alert("Please select both season and fixture");
      return;
    }

    setLoading(true);
    try {
      const gameStatsToSave: GameStat[] = playerStats.map((stat) => ({
        id: existingStats.find((e) => e.playerId === stat.playerId)?.id || 0,
        playerId: stat.playerId,
        fixtureId: selectedFixture,
        seasonId: selectedSeason,
        goals: stat.goals,
        goalsLeft: stat.goalsLeft,
        goalsRight: stat.goalsRight,
        goalsOther: stat.goalsOther,
        assists: stat.assists,
        gso: stat.gso,
        shots: stat.shots,
        shotsOnTarget: stat.shotsOnTarget,
        shotsOffTarget: stat.shotsOffTarget,
        shotsLeft: stat.shotsLeft,
        shotsRight: stat.shotsRight,
        cleanSheets: stat.cleanSheets,
        saves: stat.saves,
        penSaves: stat.penSaves,
        apps: 0,
        playerName: "",
      }));

      await PostGameStatsBulk(gameStatsToSave);
      alert("All stats saved successfully!");

      // Refresh existing stats after save
      const updatedStats = await GetFixtureGameStats(selectedFixture);
      setExistingStats(updatedStats || []);
    } catch (error) {
      console.error("Error saving stats:", error);
      alert("Error saving stats. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="container-fluid">
        {/* Modern Compact Header - Responsive */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center align-items-md-center mb-3 p-3 bg-light rounded">
          <div className="text-center text-md-start mb-3 mb-md-0">
            <h5 className="mb-0 text-success fw-bold">
              <i className="bi bi-graph-up me-2"></i>
              Game Stats Entry
            </h5>
            <small className="text-muted">
              Record player statistics for match fixtures
            </small>
          </div>
          <button
            className="btn btn-secondary"
            onClick={() => navigate("/Admin")}
          >
            <i className="bi bi-arrow-left me-1"></i>
            Back to Admin
          </button>
        </div>

        {/* Season and Fixture Selection */}
        <div className="card shadow-sm mb-4">
          <div className="card-header bg-light border-bottom">
            <h6 className="mb-0 text-success fw-semibold">
              <i className="bi bi-funnel me-2"></i>
              Select Season & Fixture
            </h6>
            <small className="text-muted">
              Choose the match to record statistics for
            </small>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-3">
                <label htmlFor="season" className="col-form-label">
                  Season
                  <select
                    id="season"
                    className="form-select"
                    value={selectedSeason}
                    onChange={(e) => setSelectedSeason(Number(e.target.value))}
                  >
                    {selectedSeason === 0 && <option value={0}>Choose a season...</option>}
                    {seasons
                      ?.sort((a, b) => {
                        if (a.active && !b.active) return -1;
                        if (!a.active && b.active) return 1;
                        return b.endYear - a.endYear;
                      })
                      .map((option) => (
                      <option key={option.id} value={option.id}>
                        U
                        {option.ageGroup +
                          " " +
                          option.endYear +
                          " (Div " +
                          option.division +
                          ")"}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="col-4">
                <label htmlFor="fixture" className="col-form-label">
                  Fixture
                  <select
                    id="fixture"
                    className="form-select"
                    value={selectedFixture}
                    onChange={(e) => setSelectedFixture(Number(e.target.value))}
                    disabled={!selectedSeason}
                  >
                    {selectedFixture === 0 && <option value={0}>Choose a fixture...</option>}
                    {fixtures?.map((option) => (
                      <option key={option.id} value={option.id}>
                        {FormatDate(option.date) +
                          " - " +
                          option.homeTeam +
                          " vs " +
                          option.awayTeam}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Player Stats Grid */}
        {selectedFixture > 0 && playerStats.length > 0 && (
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-light border-bottom">
              <h6 className="mb-0 text-success fw-semibold">
                <i className="bi bi-people me-2"></i>
                Player Statistics
              </h6>
              <small className="text-muted">
                Enter match statistics for each player
              </small>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover table-condensed table-responsive table-sm mb-0">
              <thead>
                <tr>
                  <th>Player</th>
                  <th>Goals</th>
                  <th>G Left</th>
                  <th>G Right</th>
                  <th>G Other</th>
                  <th>Assists</th>
                  <th>GSO</th>
                  <th>Shots</th>
                  <th>On Target</th>
                  <th>Off Target</th>
                  <th>S Left</th>
                  <th>S Right</th>
                  <th>Clean Sheets</th>
                  <th>Saves</th>
                  <th>Pen Saves</th>
                </tr>
              </thead>
              <tbody className="table-group-divider">
                {playerStats.map((stat) => (
                  <tr key={stat.playerId}>
                    <td style={{ minWidth: "150px" }}>
                      {stat.playerName}
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        value={stat.goals}
                        onChange={(e) =>
                          handleStatChange(
                            stat.playerId,
                            "goals",
                            Number(e.target.value),
                          )
                        }
                        style={{ width: "60px" }}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        value={stat.goalsLeft}
                        onChange={(e) =>
                          handleStatChange(
                            stat.playerId,
                            "goalsLeft",
                            Number(e.target.value),
                          )
                        }
                        style={{ width: "60px" }}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        value={stat.goalsRight}
                        onChange={(e) =>
                          handleStatChange(
                            stat.playerId,
                            "goalsRight",
                            Number(e.target.value),
                          )
                        }
                        style={{ width: "60px" }}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        value={stat.goalsOther}
                        onChange={(e) =>
                          handleStatChange(
                            stat.playerId,
                            "goalsOther",
                            Number(e.target.value),
                          )
                        }
                        style={{ width: "60px" }}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        value={stat.assists}
                        onChange={(e) =>
                          handleStatChange(
                            stat.playerId,
                            "assists",
                            Number(e.target.value),
                          )
                        }
                        style={{ width: "60px" }}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        value={stat.gso}
                        onChange={(e) =>
                          handleStatChange(
                            stat.playerId,
                            "gso",
                            Number(e.target.value),
                          )
                        }
                        style={{ width: "60px" }}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        value={stat.shots}
                        onChange={(e) =>
                          handleStatChange(
                            stat.playerId,
                            "shots",
                            Number(e.target.value),
                          )
                        }
                        style={{ width: "60px" }}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        value={stat.shotsOnTarget}
                        onChange={(e) =>
                          handleStatChange(
                            stat.playerId,
                            "shotsOnTarget",
                            Number(e.target.value),
                          )
                        }
                        style={{ width: "70px" }}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        value={stat.shotsOffTarget}
                        onChange={(e) =>
                          handleStatChange(
                            stat.playerId,
                            "shotsOffTarget",
                            Number(e.target.value),
                          )
                        }
                        style={{ width: "70px" }}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        value={stat.shotsLeft}
                        onChange={(e) =>
                          handleStatChange(
                            stat.playerId,
                            "shotsLeft",
                            Number(e.target.value),
                          )
                        }
                        style={{ width: "60px" }}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        value={stat.shotsRight}
                        onChange={(e) =>
                          handleStatChange(
                            stat.playerId,
                            "shotsRight",
                            Number(e.target.value),
                          )
                        }
                        style={{ width: "60px" }}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        value={stat.cleanSheets}
                        onChange={(e) =>
                          handleStatChange(
                            stat.playerId,
                            "cleanSheets",
                            Number(e.target.value),
                          )
                        }
                        style={{ width: "60px" }}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        value={stat.saves}
                        onChange={(e) =>
                          handleStatChange(
                            stat.playerId,
                            "saves",
                            Number(e.target.value),
                          )
                        }
                        style={{ width: "60px" }}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        value={stat.penSaves}
                        onChange={(e) =>
                          handleStatChange(
                            stat.playerId,
                            "penSaves",
                            Number(e.target.value),
                          )
                        }
                        style={{ width: "70px" }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {selectedFixture > 0 && playerStats.length > 0 && (
          <div className="card shadow-sm mb-4">
            <div className="card-body text-center">
              <button
                className="btn btn-success btn-lg"
                type="button"
                onClick={handleSaveAll}
                disabled={!selectedFixture || loading}
              >
                {loading ? (
                  <>
                    <div className="spinner-border spinner-border-sm me-2" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    Saving...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle me-2"></i>
                    Save All Stats
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminGameStats;
// import { Season } from "../../objects/season";
// import { useEffect, useState } from "react";
// import { GetSeasons } from "../../services/season-service";
// import { TigersFixture } from "../../objects/tigers-fixture";
// import { GetTigersFixtures } from "../../services/tigers-fixture-service";
// import { Player } from "../../objects/player";
// import { GetPlayers } from "../../services/player-service";
// import { GameStat } from "../../objects/game-stat";
// import { PostGameStat } from "../../services/game-stat-service";
// import TextField from "../../atoms/textfield/textfield";
// import AdminGameStat from "../../components/admin/admin-game-stat";

// const AdminGameStats = ()  =>
// {
//     const [seasons, setSeasons] = useState<Season []>();
//     const [fixtures, setFixtures] = useState<TigersFixture []>();
//     const [players, setPlayers] = useState<Player []>();

//     useEffect(() => {
//         GetSeasons().then((data) => setSeasons(data));
//         GetTigersFixtures().then((data) => {setFixtures(data)});
//         GetPlayers().then((data) => setPlayers(data));
//     },[])

//     const navigate = useNavigate();
//     const formik = useFormik({
//         initialValues :{ id : 0, player : 0, fixture : 0, goals : 0, assists : 0, gso : 0, apps : 0, playerName: "", shots : 0, tackles : 0, season : 0},
//         onSubmit : values => {
//             const gameStat : GameStat = {id : values.id, playerId : values.player, fixtureId : values.fixture, goals : values.goals, assists : values.assists, gso : values.gso, apps : 0, playerName: "", shots : values.shots, tackles : values.tackles, seasonId : values.season}
//             PostGameStat(gameStat).then(formik.resetForm);
//         }
//     });

//     return(
//         <>
//             <div>
//                 <form onSubmit={formik.handleSubmit}>
//                     <div className="row">
//                         <div className="col-2">
//                             <label htmlFor="season" className="col-form-label">Season
//                                 <select id="season" className="form-control" {...formik.getFieldProps("season")}>
//                                     <option>Select your option</option>
//                                     {seasons?.map(option => (
//                                         <option key={option.id} value={option.id}>U{option.ageGroup + " " + option.endYear + " (Div " + option.division + ")"}</option>
//                                     ))}
//                                 </select>
//                             </label>
//                         </div>
//                         <div className="col-3">
//                             <label htmlFor="fixture" className="col-form-label">Fixture
//                                 <select id="fixture" className="form-control" {...formik.getFieldProps("fixture")}>
//                                     <option>Select your option</option>
//                                     {fixtures?.map(option => (
//                                         <option key={option.id} value={option.id}>{new Date(option.date).toLocaleDateString("en-UK") + " - " + option.homeTeam + " vs " + option.awayTeam}</option>
//                                     ))}
//                                 </select>
//                             </label>
//                         </div>
//                         <div className="col-2">
//                             <label htmlFor="player" className="col-form-label">Player
//                                 <select id="player" className="form-control" {...formik.getFieldProps("player")}>
//                                     <option>Select your option</option>
//                                     {players?.map(option => (
//                                         <option key={option.id} value={option.id}>{option.firstname + " " + option.surname}</option>
//                                     ))}
//                                 </select>
//                             </label>
//                         </div>
//                     </div>
//                     <div className="row">
//                         <div className="col-2">
//                             <TextField label="Goals" name="goals" value="0" formik={formik}/>
//                         </div>
//                         <div className="col-2">
//                             <TextField label="Assists" name="assists" value="0" formik={formik}/>
//                         </div>
//                         <div className="col-2">
//                             <TextField label="GSO" name="gso" value="0" formik={formik}/>
//                         </div>
//                         <div className="col-2">
//                             <TextField label="Shots" name="shots" value="0" formik={formik}/>
//                         </div>
//                         <div className="col-2">
//                             <TextField label="Tackles" name="tackles" value="0" formik={formik}/>
//                         </div>
//                     </div>

//                     <div className="row">
//                         <div className="col-2">
//                             <button className="btn btn-secondary" onClick={()=> navigate('/Admin')}>Back</button>
//                             <button className="btn btn-primary" type="submit">Go</button>
//                         </div>
//                     </div>
//                 </form>
//             </div>
//         </>
//     );
// }

// export default AdminGameStats;
