import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GetSeasons } from "../../services/season-service";
import { GetTeams } from "../../services/teams-service";
import { GetLeagueTable, PostLeagueTableResult } from "../../services/league-table-service";
import { Season } from "../../objects/season";
import { Team } from "../../objects/team";
import { LeagueTable } from "../../objects/league-table";

interface LeagueTableForm extends LeagueTable {
    isEditing: boolean;
    hasChanges: boolean;
}

const AdminLeagueTableUpdate = () => {
    const navigate = useNavigate();
    const [seasons, setSeasons] = useState<Season[]>([]);
    const [selectedSeason, setSelectedSeason] = useState<Season | null>(null);
    const [allTeams, setAllTeams] = useState<Team[]>([]);
    const [leagueTableData, setLeagueTableData] = useState<LeagueTableForm[]>([]);
    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState<{message: string, type: 'success' | 'error'} | null>(null);

    const loadLeagueTable = async (seasonId: number) => {
        setLoading(true);
        try {
            const leagueData = await GetLeagueTable(seasonId);

            if (leagueData && leagueData.length > 0) {
                const formattedData: LeagueTableForm[] = leagueData
                    .map((entry: LeagueTable) => ({
                        ...entry,
                        isEditing: false,
                        hasChanges: false
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
            setFeedback({message: 'Error loading league table. Please try again.', type: 'error'});
        } finally {
            setLoading(false);
        }
    };

    const handleSeasonChange = async (seasonId: number) => {
        const season = seasons.find(s => s.id === seasonId);
        if (!season) return;

        setSelectedSeason(season);
        await loadLeagueTable(seasonId);
    };

    const toggleEdit = (index: number) => {
        setLeagueTableData(prev => prev.map((team, i) =>
            i === index
                ? { ...team, isEditing: !team.isEditing, hasChanges: false }
                : { ...team, isEditing: false }
        ));
    };

    const updateTeamStats = (index: number, field: keyof LeagueTable, value: any) => {
        setLeagueTableData(prev => prev.map((team, i) => {
            if (i === index) {
                const updated = { ...team, [field]: parseInt(value) || 0, hasChanges: true };

                // Auto-calculate derived values
                if (field === 'won' || field === 'lost' || field === 'drawn') {
                    updated.pld = updated.won + updated.lost + updated.drawn;
                    updated.points = (updated.won * 3) + updated.drawn;
                }

                if (field === 'glsFor' || field === 'glsA') {
                    updated.gd = updated.glsFor - updated.glsA;
                }

                // Calculate win percentage
                if (updated.pld > 0) {
                    updated.winPercentage = Math.round((updated.won / updated.pld) * 10000) / 100; // 2 decimal places
                } else {
                    updated.winPercentage = 0;
                }

                // Calculate achieveable points (assuming remaining games could be won)
                // This would need more context about total games in season, for now just use current points
                updated.achieveablePoints = updated.points;

                return updated;
            }
            return team;
        }));
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
                achieveablePoints: team.achieveablePoints
            };

            await PostLeagueTableResult(leagueTableResult);

            setLeagueTableData(prev => prev.map((t, i) =>
                i === index
                    ? { ...t, isEditing: false, hasChanges: false }
                    : t
            ));

            setFeedback({message: 'Team stats saved successfully!', type: 'success'});
            setTimeout(() => setFeedback(null), 3000);

            // Reload to get updated league positions
            if (selectedSeason) {
                await loadLeagueTable(selectedSeason.id);
            }

        } catch (error) {
            console.error("Error saving team stats:", error);
            setFeedback({message: 'Error saving team stats. Please try again.', type: 'error'});
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
                const [seasonsData, teamsData] = await Promise.all([
                    GetSeasons(),
                    GetTeams()
                ]);

                setSeasons(seasonsData || []);
                setAllTeams(teamsData || []);

                // Auto-select active season
                const activeSeason = (seasonsData || []).find((season: Season) => season.active);
                if (activeSeason) {
                    await handleSeasonChange(activeSeason.id);
                }
            } catch (error) {
                console.error("Error initializing data:", error);
            }
        };

        initializeData();
    }, []);

    return (
        <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h3>League Table Management</h3>
                <button
                    className="btn btn-secondary"
                    onClick={() => navigate('/Admin')}
                >
                    Back to Admin
                </button>
            </div>

            {feedback && (
                <div className={`alert ${feedback.type === 'success' ? 'alert-success' : 'alert-danger'} alert-dismissible fade show`} role="alert">
                    {feedback.message}
                </div>
            )}

            {/* Season Selection */}
            <div className="row mb-4">
                <div className="col-md-4">
                    <label className="form-label">Select Season</label>
                    <select
                        className="form-select"
                        value={selectedSeason?.id || 0}
                        onChange={(e) => handleSeasonChange(parseInt(e.target.value))}
                    >
                        <option value={0}>Choose a season...</option>
                        {seasons.map(season => (
                            <option key={season.id} value={season.id}>
                                U{season.ageGroup} {season.endYear} (Div {season.division})
                            </option>
                        ))}
                    </select>
                </div>
                {selectedSeason && (
                    <div className="col-md-8">
                        <div className="card">
                            <div className="card-body">
                                <h6 className="card-title">League Table Summary</h6>
                                <p className="card-text mb-0">
                                    <strong>{leagueTableData.length} teams</strong> in {selectedSeason.monthStart} {selectedSeason.startYear} - {selectedSeason.monthEnd} {selectedSeason.endYear}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* League Table */}
            {selectedSeason && (
                <div className="row">
                    <div className="col-12">
                        <h5>League Table</h5>
                        {loading ? (
                            <div className="text-center py-4">
                                <div className="spinner-border" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            </div>
                        ) : leagueTableData.length === 0 ? (
                            <div className="alert alert-info">
                                No league table data found for this season.
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-striped table-bordered">
                                    <thead className="table-dark">
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
                                    <tbody>
                                        {leagueTableData.map((team, index) => (
                                            <tr key={team.id} className={team.isEditing ? 'table-warning' : ''}>
                                                <td className="fw-bold">{index + 1}</td>
                                                <td className="fw-bold">{team.teamName}</td>
                                                <td>
                                                    <span className="badge bg-info">{team.pld}</span>
                                                </td>
                                                <td>
                                                    {team.isEditing ? (
                                                        <input
                                                            type="number"
                                                            className="form-control form-control-sm"
                                                            style={{ width: '60px' }}
                                                            min="0"
                                                            value={team.won}
                                                            onChange={(e) => updateTeamStats(index, 'won', e.target.value)}
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
                                                            style={{ width: '60px' }}
                                                            min="0"
                                                            value={team.drawn}
                                                            onChange={(e) => updateTeamStats(index, 'drawn', e.target.value)}
                                                        />
                                                    ) : (
                                                        <span className="badge bg-warning">{team.drawn}</span>
                                                    )}
                                                </td>
                                                <td>
                                                    {team.isEditing ? (
                                                        <input
                                                            type="number"
                                                            className="form-control form-control-sm"
                                                            style={{ width: '60px' }}
                                                            min="0"
                                                            value={team.lost}
                                                            onChange={(e) => updateTeamStats(index, 'lost', e.target.value)}
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
                                                            style={{ width: '70px' }}
                                                            min="0"
                                                            value={team.glsFor}
                                                            onChange={(e) => updateTeamStats(index, 'glsFor', e.target.value)}
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
                                                            style={{ width: '70px' }}
                                                            min="0"
                                                            value={team.glsA}
                                                            onChange={(e) => updateTeamStats(index, 'glsA', e.target.value)}
                                                        />
                                                    ) : (
                                                        team.glsA
                                                    )}
                                                </td>
                                                <td>
                                                    <span className={`badge ${team.gd >= 0 ? 'bg-success' : 'bg-danger'}`}>
                                                        {team.gd > 0 ? '+' : ''}{team.gd}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="badge bg-primary fs-6">{team.points}</span>
                                                </td>
                                                <td>
                                                    <span className="badge bg-secondary">{team.winPercentage}%</span>
                                                </td>
                                                <td>
                                                    {team.isEditing ? (
                                                        <div className="btn-group" role="group">
                                                            <button
                                                                className="btn btn-success btn-sm"
                                                                onClick={() => saveTeamStats(index)}
                                                                disabled={loading || !team.hasChanges}
                                                            >
                                                                Save
                                                            </button>
                                                            <button
                                                                className="btn btn-secondary btn-sm"
                                                                onClick={() => cancelEdit(index)}
                                                                disabled={loading}
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            className="btn btn-outline-primary btn-sm"
                                                            onClick={() => toggleEdit(index)}
                                                            disabled={loading}
                                                        >
                                                            Edit
                                                        </button>
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