import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GetSeasons } from "../../services/season-service";
import { GetTeams } from "../../services/teams-service";
import {
  GetTigersFixturesForSeason,
  PostTigersFixture,
  PutTigersFixture,
} from "../../services/tigers-fixture-service";
import { Season } from "../../objects/season";
import { Team } from "../../objects/team";
import { TigersFixture } from "../../objects/tigers-fixture";
import { GameLocation, GameType, ResultType } from "../../objects/enums/enums";
import {
  EditButton,
  SaveButton,
  CancelButton,
} from "../../atoms/buttons/admin-action-buttons";

interface TigersFixtureForm {
  id: number;
  fixtureId: number;
  homeTeam: string;
  awayTeam: string;
  homeTeamScore: number;
  awayTeamScore: number;
  date: Date;
  result: ResultType;
  location: GameLocation;
  type: GameType;
  glsFor: number;
  glsA: number;
  pts: number;
  isEditing: boolean;
  hasChanges: boolean;
}

const AdminTigersFixture = () => {
  const navigate = useNavigate();
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<Season | null>(null);
  const [allTeams, setAllTeams] = useState<Team[]>([]);
  const [tigersFixtures, setTigersFixtures] = useState<TigersFixtureForm[]>([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Enum options
  const gameTypes = Object.entries(GameType).map(([key, value]) => ({
    key,
    value,
  }));
  const filteredGameTypeOptions = gameTypes.filter(
    (option) => !isNaN(Number(option.key)),
  );
  const gameResult = Object.entries(ResultType).map(([key, value]) => ({
    key,
    value,
  }));
  const filteredResultOptions = gameResult.filter(
    (option) => !isNaN(Number(option.key)),
  );
  const gameLocation = Object.entries(GameLocation).map(([key, value]) => ({
    key,
    value,
  }));
  const filteredLocationOptions = gameLocation.filter(
    (option) => !isNaN(Number(option.key)),
  );

  const loadTigersFixtures = async (seasonId: number) => {
    setLoading(true);
    try {
      const tigersFixtures = await GetTigersFixturesForSeason(seasonId);

      if (tigersFixtures) {
        const tigersFixturesData = tigersFixtures
          .map((fixture: any): TigersFixtureForm => {
            return {
              id: fixture.id,
              fixtureId: fixture.id, // TigersFixture ID is the same as its own ID
              homeTeam: fixture.homeTeam,
              awayTeam: fixture.awayTeam,
              homeTeamScore: fixture.homeTeamScore,
              awayTeamScore: fixture.awayTeamScore,
              date: new Date(fixture.date),
              result: fixture.result,
              location: fixture.location,
              type: fixture.type,
              glsFor: fixture.glsFor,
              glsA: fixture.glsA,
              pts: fixture.pts,
              isEditing: false,
              hasChanges: false,
            };
          })
          .sort(
            (a: TigersFixtureForm, b: TigersFixtureForm) =>
              new Date(a.date).getTime() - new Date(b.date).getTime(),
          );

        setTigersFixtures(tigersFixturesData);
      }
    } catch (error) {
      console.error("Error loading Tigers fixtures:", error);
      setFeedback({
        message: "Error loading fixtures. Please try again.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSeasonChange = async (seasonId: number) => {
    const season = seasons.find((s) => s.id === seasonId);
    if (!season) return;

    setSelectedSeason(season);
    await loadTigersFixtures(seasonId);
  };

  const toggleEdit = (index: number) => {
    setTigersFixtures((prev) =>
      prev.map((fixture, i) =>
        i === index
          ? { ...fixture, isEditing: !fixture.isEditing, hasChanges: false }
          : { ...fixture, isEditing: false },
      ),
    );
  };

  const updateFixture = (
    index: number,
    field: keyof TigersFixtureForm,
    value: any,
  ) => {
    setTigersFixtures((prev) =>
      prev.map((fixture, i) => {
        if (i === index) {
          const updated = { ...fixture, [field]: value, hasChanges: true };

          // Auto-calculate derived values
          if (field === "homeTeamScore" || field === "awayTeamScore") {
            const tigersIsHome = fixture.location === GameLocation.Home;
            const tigersScore = tigersIsHome
              ? updated.homeTeamScore
              : updated.awayTeamScore;
            const opponentScore = tigersIsHome
              ? updated.awayTeamScore
              : updated.homeTeamScore;

            updated.glsFor = tigersScore;
            updated.glsA = opponentScore;

            if (tigersScore > opponentScore) {
              updated.result = ResultType.Win;
              updated.pts = 3;
            } else if (tigersScore === opponentScore) {
              updated.result = ResultType.Draw;
              updated.pts = 1;
            } else {
              updated.result = ResultType.Loss;
              updated.pts = 0;
            }
          }

          // Auto-calculate points when result changes
          if (field === "result") {
            if (updated.result === ResultType.Win) {
              updated.pts = 3;
            } else if (updated.result === ResultType.Draw) {
              updated.pts = 1;
            } else {
              updated.pts = 0;
            }
          }

          return updated;
        }
        return fixture;
      }),
    );
  };

  const saveFixture = async (index: number) => {
    const fixture = tigersFixtures[index];
    setLoading(true);

    try {
      // Find the team IDs from the fixture data
      // Use allTeams instead of seasonTeams to support friendly fixtures with teams not in the league
      const homeTeamId =
        allTeams.find((t) => t.name === fixture.homeTeam)?.id || 0;
      const awayTeamId =
        allTeams.find((t) => t.name === fixture.awayTeam)?.id || 0;

      const tigersFixture: TigersFixture = {
        id: fixture.id,
        homeTeam: homeTeamId.toString(),
        awayTeam: awayTeamId.toString(),
        homeTeamScore: fixture.homeTeamScore,
        awayTeamScore: fixture.awayTeamScore,
        date: fixture.date,
        result: fixture.result,
        location: fixture.location,
        seasonId: selectedSeason?.id || 0,
        type: fixture.type,
        pts: fixture.pts,
        glsFor: fixture.glsFor,
        glsA: fixture.glsA,
      };

      // Use PUT for existing fixtures (id > 0) or POST for new fixtures (id = 0)
      if (fixture.id > 0) {
        await PutTigersFixture(tigersFixture);
      } else {
        await PostTigersFixture(tigersFixture);
      }

      setTigersFixtures((prev) =>
        prev.map((f, i) =>
          i === index ? { ...f, isEditing: false, hasChanges: false } : f,
        ),
      );

      setFeedback({ message: "Fixture saved successfully!", type: "success" });
      setTimeout(() => setFeedback(null), 3000);
    } catch (error) {
      console.error("Error saving fixture:", error);
      setFeedback({
        message: "Error saving fixture. Please try again.",
        type: "error",
      });
      setTimeout(() => setFeedback(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = (index: number) => {
    setTigersFixtures((prev) =>
      prev.map((fixture, i) =>
        i === index
          ? { ...fixture, isEditing: false, hasChanges: false }
          : fixture,
      ),
    );
  };

  useEffect(() => {
    const initializeData = async () => {
      try {
        const [seasonsData, teamsData] = await Promise.all([
          GetSeasons(),
          GetTeams(),
        ]);

        setSeasons(seasonsData || []);
        setAllTeams(teamsData || []);

        // Auto-select active season
        const activeSeason = (seasonsData || []).find(
          (season: Season) => season.active,
        );
        if (activeSeason) {
          await handleSeasonChange(activeSeason.id);
        }
      } catch (error) {
        console.error("Error initializing data:", error);
      }
    };

    initializeData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="container-fluid">
      {/* Modern Compact Header - Responsive */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center align-items-md-center mb-3 p-3 bg-light rounded">
        <div className="text-center text-md-start mb-3 mb-md-0">
          <h5 className="mb-0 text-success fw-bold">
            <i className="bi bi-shield-check me-2"></i>
            Tigers Fixture Management
          </h5>
          <small className="text-muted">
            Manage Newport Tigers match results and statistics
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

      {feedback && (
        <div
          className={`alert ${feedback.type === "success" ? "alert-success" : "alert-danger"} alert-dismissible fade show`}
          role="alert"
        >
          {feedback.message}
        </div>
      )}

      {/* Season Selection */}
      <div className="card shadow-sm mb-4">
        <div className="card-header bg-light border-bottom">
          <h6 className="mb-0 text-success fw-semibold">
            <i className="bi bi-funnel me-2"></i>
            Season Selection
          </h6>
          <small className="text-muted">
            Choose the season to manage Tigers fixtures for
          </small>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-4">
              <label className="form-label fw-semibold">Select Season</label>
              <select
                className="form-select"
                value={selectedSeason?.id || 0}
                onChange={(e) => handleSeasonChange(parseInt(e.target.value))}
              >
                {!selectedSeason && (
                  <option value={0}>Choose a season...</option>
                )}
                {seasons
                  .sort((a, b) => {
                    // Active season first
                    if (a.active && !b.active) return -1;
                    if (!a.active && b.active) return 1;
                    // Then by year and age group
                    if (b.endYear !== a.endYear) return b.endYear - a.endYear;
                    return b.ageGroup - a.ageGroup;
                  })
                  .map((season) => (
                    <option key={season.id} value={season.id}>
                      U{season.ageGroup} {season.endYear} (Div {season.division}
                      ){season.active && " (Active)"}
                    </option>
                  ))}
              </select>
            </div>
            {selectedSeason && (
              <div className="col-md-8">
                <div className="alert alert-info mb-0">
                  <div className="d-flex align-items-center">
                    <i className="bi bi-info-circle me-2"></i>
                    <div>
                      <strong>{tigersFixtures.length} Tigers fixtures</strong>{" "}
                      found for {selectedSeason.monthStart}{" "}
                      {selectedSeason.startYear} - {selectedSeason.monthEnd}{" "}
                      {selectedSeason.endYear}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tigers Fixtures List */}
      {selectedSeason && (
        <div className="row">
          <div className="col-12">
            <h5>Tigers Fixtures</h5>
            {loading ? (
              <div className="text-center py-4">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : tigersFixtures.length === 0 ? (
              <div className="alert alert-info">
                No Tigers fixtures found for this season.
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover table-condensed table-responsive table-sm">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Home Team</th>
                      <th>Away Team</th>
                      <th>Score</th>
                      <th>Result</th>
                      <th>Location</th>
                      <th>Type</th>
                      <th>Goals F/A</th>
                      <th>Points</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody className="table-group-divider">
                    {tigersFixtures.map((fixture, index) => (
                      <tr key={fixture.fixtureId}>
                        <td>
                          {fixture.date.toLocaleDateString("en-GB", {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                          })}
                        </td>
                        <td>{fixture.homeTeam}</td>
                        <td>{fixture.awayTeam}</td>
                        <td>
                          {fixture.isEditing ? (
                            <div className="d-flex">
                              <input
                                type="number"
                                className="form-control form-control-sm me-1"
                                style={{ width: "50px" }}
                                min="0"
                                value={fixture.homeTeamScore}
                                onChange={(e) =>
                                  updateFixture(
                                    index,
                                    "homeTeamScore",
                                    parseInt(e.target.value) || 0,
                                  )
                                }
                              />
                              <span className="align-self-center">-</span>
                              <input
                                type="number"
                                className="form-control form-control-sm ms-1"
                                style={{ width: "50px" }}
                                min="0"
                                value={fixture.awayTeamScore}
                                onChange={(e) =>
                                  updateFixture(
                                    index,
                                    "awayTeamScore",
                                    parseInt(e.target.value) || 0,
                                  )
                                }
                              />
                            </div>
                          ) : (
                            `${fixture.homeTeamScore} - ${fixture.awayTeamScore}`
                          )}
                        </td>
                        <td>
                          {fixture.isEditing ? (
                            <select
                              className="form-select form-select-sm"
                              value={fixture.result}
                              onChange={(e) =>
                                updateFixture(
                                  index,
                                  "result",
                                  parseInt(e.target.value),
                                )
                              }
                            >
                              {filteredResultOptions.map((option) => (
                                <option key={option.key} value={option.key}>
                                  {option.value}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span
                              className={`badge ${
                                fixture.result === ResultType.Win
                                  ? "bg-success"
                                  : fixture.result === ResultType.Draw
                                    ? "bg-warning"
                                    : "bg-danger"
                              }`}
                            >
                              {ResultType[fixture.result]}
                            </span>
                          )}
                        </td>
                        <td>
                          {fixture.isEditing ? (
                            <select
                              className="form-select form-select-sm"
                              value={fixture.location}
                              onChange={(e) =>
                                updateFixture(
                                  index,
                                  "location",
                                  parseInt(e.target.value),
                                )
                              }
                            >
                              {filteredLocationOptions.map((option) => (
                                <option key={option.key} value={option.key}>
                                  {option.value}
                                </option>
                              ))}
                            </select>
                          ) : (
                            GameLocation[fixture.location]
                          )}
                        </td>
                        <td>
                          {fixture.isEditing ? (
                            <select
                              className="form-select form-select-sm"
                              value={fixture.type}
                              onChange={(e) =>
                                updateFixture(
                                  index,
                                  "type",
                                  parseInt(e.target.value),
                                )
                              }
                            >
                              {filteredGameTypeOptions.map((option) => (
                                <option key={option.key} value={option.key}>
                                  {option.value}
                                </option>
                              ))}
                            </select>
                          ) : (
                            GameType[fixture.type]
                          )}
                        </td>
                        <td>
                          {fixture.isEditing ? (
                            <div className="d-flex">
                              <input
                                type="number"
                                className="form-control form-control-sm me-1"
                                style={{ width: "50px" }}
                                min="0"
                                value={fixture.glsFor}
                                onChange={(e) =>
                                  updateFixture(
                                    index,
                                    "glsFor",
                                    parseInt(e.target.value) || 0,
                                  )
                                }
                              />
                              <span className="align-self-center">/</span>
                              <input
                                type="number"
                                className="form-control form-control-sm ms-1"
                                style={{ width: "50px" }}
                                min="0"
                                value={fixture.glsA}
                                onChange={(e) =>
                                  updateFixture(
                                    index,
                                    "glsA",
                                    parseInt(e.target.value) || 0,
                                  )
                                }
                              />
                            </div>
                          ) : (
                            `${fixture.glsFor} / ${fixture.glsA}`
                          )}
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              fixture.pts === 3
                                ? "bg-success"
                                : fixture.pts === 1
                                  ? "bg-warning"
                                  : "bg-secondary"
                            }`}
                          >
                            {fixture.pts}
                          </span>
                        </td>
                        <td>
                          {fixture.isEditing ? (
                            <div className="btn-group" role="group">
                              <SaveButton
                                onClick={() => saveFixture(index)}
                                disabled={!fixture.hasChanges}
                                loading={loading}
                              />
                              <CancelButton
                                onClick={() => cancelEdit(index)}
                                disabled={loading}
                              />
                            </div>
                          ) : (
                            <EditButton
                              onClick={() => toggleEdit(index)}
                              disabled={loading}
                            />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTigersFixture;
