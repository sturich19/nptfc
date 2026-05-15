import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GetSeasons } from "../../services/season-service";
import { GetTeams } from "../../services/teams-service";
import {
  GetLeagueTable,
  PostLeagueTableResult,
} from "../../services/league-table-service";
import { Season } from "../../objects/season";
import { LeagueTable } from "../../objects/league-table";
import { EditButton, SaveButton, CancelButton } from "../../atoms/buttons/admin-action-buttons";

interface LeagueTableForm extends LeagueTable {
  isEditing: boolean;
  hasChanges: boolean;
}

const AdminLeagueTableUpdate = () => {
  const navigate = useNavigate();
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<Season | null>(null);
  const [leagueTableData, setLeagueTableData] = useState<LeagueTableForm[]>([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const loadLeagueTable = async (seasonId: number) => {
    setLoading(true);
    try {
      const leagueData = await GetLeagueTable(seasonId);

      if (leagueData && leagueData.length > 0) {
        const formattedData: LeagueTableForm[] = leagueData
          .map((entry: LeagueTable) => ({
            ...entry,
            isEditing: false,
            hasChanges: false,
          }))
          .sort((a: LeagueTable, b: LeagueTable) => {
            // Sort by points descending, then by goal difference, then by goals for
            if (b.points !== a.points) return b.points - a.points;
            if (b.gd !== a.gd) return b.gd - a.gd;
            return b.glsFor - a.glsFor;
          });

        setLeagueTableData(formattedData);
      } else {
        setLeagueTableData([]);
      }
    } catch (error) {
      console.error("Error loading league table:", error);
      setFeedback({
        message: "Error loading league table. Please try again.",
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
    await loadLeagueTable(seasonId);
  };

  const toggleEdit = (index: number) => {
    setLeagueTableData((prev) =>
      prev.map((team, i) =>
        i === index
          ? { ...team, isEditing: !team.isEditing, hasChanges: false }
          : { ...team, isEditing: false },
      ),
    );
  };

  const updateTeamStats = (
    index: number,
    field: keyof LeagueTable,
    value: any,
  ) => {
    setLeagueTableData((prev) =>
      prev.map((team, i) => {
        if (i === index) {
          const updated = {
            ...team,
            [field]: parseInt(value) || 0,
            hasChanges: true,
          };

          // Auto-calculate derived values
          if (field === "won" || field === "lost" || field === "drawn") {
            updated.pld = updated.won + updated.lost + updated.drawn;
            updated.points = updated.won * 3 + updated.drawn;
          }

          if (field === "glsFor" || field === "glsA") {
            updated.gd = updated.glsFor - updated.glsA;
          }

          // Calculate win percentage
          if (updated.pld > 0) {
            updated.winPercentage =
              Math.round((updated.won / updated.pld) * 10000) / 100; // 2 decimal places
          } else {
            updated.winPercentage = 0;
          }

          // Calculate achieveable points (assuming remaining games could be won)
          // This would need more context about total games in season, for now just use current points
          updated.achieveablePoints = updated.points;

          return updated;
        }
        return team;
      }),
    );
  };

  const saveTeamStats = async (index: number) => {
    const team = leagueTableData[index];
    setLoading(true);

    try {
      const leagueTableResult: LeagueTable = {
        id: team.id,
        teamId: team.teamId,
        seasonId: team.seasonId,
        teamName: team.teamName,
        won: team.won,
        lost: team.lost,
        drawn: team.drawn,
        glsFor: team.glsFor,
        glsA: team.glsA,
        gd: team.gd,
        pld: team.pld,
        points: team.points,
        winPercentage: team.winPercentage,
        achieveablePoints: team.achieveablePoints,
      };

      await PostLeagueTableResult(leagueTableResult);

      setLeagueTableData((prev) =>
        prev.map((t, i) =>
          i === index ? { ...t, isEditing: false, hasChanges: false } : t,
        ),
      );

      setFeedback({
        message: "Team stats saved successfully!",
        type: "success",
      });
      setTimeout(() => setFeedback(null), 3000);

      // Reload to get updated league positions
      if (selectedSeason) {
        await loadLeagueTable(selectedSeason.id);
      }
    } catch (error) {
      console.error("Error saving team stats:", error);
      setFeedback({
        message: "Error saving team stats. Please try again.",
        type: "error",
      });
      setTimeout(() => setFeedback(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = (index: number) => {
    if (selectedSeason) {
      loadLeagueTable(selectedSeason.id);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      try {
        const [seasonsData] = await Promise.all([
          GetSeasons(),
          GetTeams(),
        ]);

        setSeasons(seasonsData || []);

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
            <i className="bi bi-table me-2"></i>
            League Table Management
          </h5>
          <small className="text-muted">
            Update team statistics and league positions
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
            Choose the season to manage league table for
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
                {!selectedSeason && <option value={0}>Choose a season...</option>}
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
                      U{season.ageGroup} {season.endYear} (Div {season.division})
                      {season.active && ' (Active)'}
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
                      <strong>{leagueTableData.length} teams</strong> in{" "}
                      {selectedSeason.monthStart} {selectedSeason.startYear} -{" "}
                      {selectedSeason.monthEnd} {selectedSeason.endYear}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* League Table */}
      {selectedSeason && (
        <div className="card shadow-sm mb-4">
          <div className="card-header bg-light border-bottom">
            <h6 className="mb-0 text-success fw-semibold">
              <i className="bi bi-trophy me-2"></i>
              League Table
            </h6>
            <small className="text-muted">
              Click Edit to update team statistics
            </small>
          </div>
          <div className="card-body p-0">
            {loading ? (
              <div className="text-center py-4">
                <div className="spinner-border text-success" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : leagueTableData.length === 0 ? (
              <div className="text-center py-4 text-muted">
                <i className="bi bi-table display-4"></i>
                <p className="mt-2">No league table data found for this season.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover table-condensed table-responsive table-sm mb-0">
                  <thead>
                    <tr>
                      <th>Pos</th>
                      <th>Team</th>
                      <th>Pld</th>
                      <th>W</th>
                      <th>D</th>
                      <th>L</th>
                      <th>GF</th>
                      <th>GA</th>
                      <th>GD</th>
                      <th>Pts</th>
                      <th>Win%</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody className="table-group-divider">
                    {leagueTableData.map((team, index) => (
                      <tr
                        key={team.id}
                        className={team.isEditing ? "table-warning" : ""}
                      >
                        <td>{index + 1}</td>
                        <td>{team.teamName}</td>
                        <td>
                          <span className="badge bg-info">{team.pld}</span>
                        </td>
                        <td>
                          {team.isEditing ? (
                            <input
                              type="number"
                              className="form-control form-control-sm"
                              style={{ width: "60px" }}
                              min="0"
                              value={team.won}
                              onChange={(e) =>
                                updateTeamStats(index, "won", e.target.value)
                              }
                            />
                          ) : (
                            <span className="badge bg-success">{team.won}</span>
                          )}
                        </td>
                        <td>
                          {team.isEditing ? (
                            <input
                              type="number"
                              className="form-control form-control-sm"
                              style={{ width: "60px" }}
                              min="0"
                              value={team.drawn}
                              onChange={(e) =>
                                updateTeamStats(index, "drawn", e.target.value)
                              }
                            />
                          ) : (
                            <span className="badge bg-warning">
                              {team.drawn}
                            </span>
                          )}
                        </td>
                        <td>
                          {team.isEditing ? (
                            <input
                              type="number"
                              className="form-control form-control-sm"
                              style={{ width: "60px" }}
                              min="0"
                              value={team.lost}
                              onChange={(e) =>
                                updateTeamStats(index, "lost", e.target.value)
                              }
                            />
                          ) : (
                            <span className="badge bg-danger">{team.lost}</span>
                          )}
                        </td>
                        <td>
                          {team.isEditing ? (
                            <input
                              type="number"
                              className="form-control form-control-sm"
                              style={{ width: "70px" }}
                              min="0"
                              value={team.glsFor}
                              onChange={(e) =>
                                updateTeamStats(index, "glsFor", e.target.value)
                              }
                            />
                          ) : (
                            team.glsFor
                          )}
                        </td>
                        <td>
                          {team.isEditing ? (
                            <input
                              type="number"
                              className="form-control form-control-sm"
                              style={{ width: "70px" }}
                              min="0"
                              value={team.glsA}
                              onChange={(e) =>
                                updateTeamStats(index, "glsA", e.target.value)
                              }
                            />
                          ) : (
                            team.glsA
                          )}
                        </td>
                        <td>
                          <span
                            className={`badge ${team.gd >= 0 ? "bg-success" : "bg-danger"}`}
                          >
                            {team.gd > 0 ? "+" : ""}
                            {team.gd}
                          </span>
                        </td>
                        <td>
                          <span className="badge bg-primary fs-6">
                            {team.points}
                          </span>
                        </td>
                        <td>
                          <span className="badge bg-secondary">
                            {team.winPercentage.toFixed(2)}%
                          </span>
                        </td>
                        <td>
                          {team.isEditing ? (
                            <div className="btn-group" role="group">
                              <SaveButton
                                onClick={() => saveTeamStats(index)}
                                disabled={!team.hasChanges}
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

export default AdminLeagueTableUpdate;
