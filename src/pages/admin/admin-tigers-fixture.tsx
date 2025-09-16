import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GetSeasons } from "../../services/season-service";
import { GetTeams } from "../../services/teams-service";
import { GetLeagueTable } from "../../services/league-table-service";
import { GetFixturesForSeason } from "../../services/fixture-service";
import { PostTigersFixture } from "../../services/tigers-fixture-service";
import { Season } from "../../objects/season";
import { Team } from "../../objects/team";
import { LeagueTable } from "../../objects/league-table";
import { Fixture } from "../../objects/fixture";
import { TigersFixture } from "../../objects/tigers-fixture";
import { GameLocation, GameType, ResultType } from "../../objects/enums/enums";

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
    const [seasonTeams, setSeasonTeams] = useState<Team[]>([]);
    const [tigersFixtures, setTigersFixtures] = useState<TigersFixtureForm[]>([]);
    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState<{message: string, type: 'success' | 'error'} | null>(null);

    // Enum options
    const gameTypes = Object.entries(GameType).map(([key, value]) => ({key, value}));
    const filteredGameTypeOptions = gameTypes.filter(option => !isNaN(Number(option.key)));
    const gameResult = Object.entries(ResultType).map(([key, value]) => ({key, value}));
    const filteredResultOptions = gameResult.filter(option => !isNaN(Number(option.key)));
    const gameLocation = Object.entries(GameLocation).map(([key, value]) => ({key, value}));
    const filteredLocationOptions = gameLocation.filter(option => !isNaN(Number(option.key)));

    const loadTeamsForSeason = async (seasonId: number) => {
        try {
            const leagueTable = await GetLeagueTable(seasonId);
            if (leagueTable && leagueTable.length > 0) {
                const teamIds = leagueTable.map((entry: LeagueTable) => entry.teamId);
                const teamsInSeason = allTeams.filter(team => teamIds.includes(team.id));
                setSeasonTeams(teamsInSeason);
            } else {
                setSeasonTeams([]);
            }
        } catch (error) {
            console.error("Error loading teams for season:", error);
            setSeasonTeams([]);
        }
    };

    const loadTigersFixtures = async (seasonId: number) => {
        setLoading(true);
        try {
            const fixtures = await GetFixturesForSeason(seasonId);

            if (fixtures) {
                // Filter fixtures that include Team ID 1 (Tigers)
                const tigersFixturesData = fixtures
                    .filter((fixture: Fixture) => fixture.homeTeamId === 1 || fixture.awayTeamId === 1)
                    .map((fixture: Fixture): TigersFixtureForm => {
                        const homeTeam = allTeams.find(t => t.id === fixture.homeTeamId);
                        const awayTeam = allTeams.find(t => t.id === fixture.awayTeamId);

                        // Calculate Tigers-specific values
                        const tigersScore = fixture.homeTeamId === 1 ? fixture.homeTeamScore : fixture.awayTeamScore;
                        const opponentScore = fixture.homeTeamId === 1 ? fixture.awayTeamScore : fixture.homeTeamScore;

                        let result = ResultType.Draw;
                        let points = 1;
                        if (tigersScore > opponentScore) {
                            result = ResultType.Win;
                            points = 3;
                        } else if (tigersScore < opponentScore) {
                            result = ResultType.Loss;
                            points = 0;
                        }

                        return {
                            id: 0, // Will be set when creating TigersFixture
                            fixtureId: fixture.id,
                            homeTeam: homeTeam?.name || '',
                            awayTeam: awayTeam?.name || '',
                            homeTeamScore: fixture.homeTeamScore,
                            awayTeamScore: fixture.awayTeamScore,
                            date: new Date(fixture.date),
                            result: result,
                            location: fixture.homeTeamId === 1 ? GameLocation.Home : GameLocation.Away,
                            type: GameType.League, // Default
                            glsFor: tigersScore,
                            glsA: opponentScore,
                            pts: points,
                            isEditing: false,
                            hasChanges: false
                        };
                    })
                    .sort((a: TigersFixtureForm, b: TigersFixtureForm) => new Date(a.date).getTime() - new Date(b.date).getTime());

                setTigersFixtures(tigersFixturesData);
            }
        } catch (error) {
            console.error("Error loading Tigers fixtures:", error);
            setFeedback({message: 'Error loading fixtures. Please try again.', type: 'error'});
        } finally {
            setLoading(false);
        }
    };

    const handleSeasonChange = async (seasonId: number) => {
        const season = seasons.find(s => s.id === seasonId);
        if (!season) return;

        setSelectedSeason(season);
        await loadTeamsForSeason(seasonId);
        await loadTigersFixtures(seasonId);
    };

    const toggleEdit = (index: number) => {
        setTigersFixtures(prev => prev.map((fixture, i) =>
            i === index
                ? { ...fixture, isEditing: !fixture.isEditing, hasChanges: false }
                : { ...fixture, isEditing: false }
        ));
    };

    const updateFixture = (index: number, field: keyof TigersFixtureForm, value: any) => {
        setTigersFixtures(prev => prev.map((fixture, i) => {
            if (i === index) {
                const updated = { ...fixture, [field]: value, hasChanges: true };

                // Auto-calculate derived values
                if (field === 'homeTeamScore' || field === 'awayTeamScore') {
                    const tigersIsHome = fixture.location === GameLocation.Home;
                    const tigersScore = tigersIsHome ? updated.homeTeamScore : updated.awayTeamScore;
                    const opponentScore = tigersIsHome ? updated.awayTeamScore : updated.homeTeamScore;

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
                if (field === 'result') {
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
        }));
    };

    const saveFixture = async (index: number) => {
        const fixture = tigersFixtures[index];
        setLoading(true);

        try {
            // Find the team IDs from the fixture data
            const homeTeamId = seasonTeams.find(t => t.name === fixture.homeTeam)?.id || 0;
            const awayTeamId = seasonTeams.find(t => t.name === fixture.awayTeam)?.id || 0;

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
                glsA: fixture.glsA
            };

            await PostTigersFixture(tigersFixture);

            setTigersFixtures(prev => prev.map((f, i) =>
                i === index
                    ? { ...f, isEditing: false, hasChanges: false }
                    : f
            ));

            setFeedback({message: 'Fixture saved successfully!', type: 'success'});
            setTimeout(() => setFeedback(null), 3000);

        } catch (error) {
            console.error("Error saving fixture:", error);
            setFeedback({message: 'Error saving fixture. Please try again.', type: 'error'});
            setTimeout(() => setFeedback(null), 3000);
        } finally {
            setLoading(false);
        }
    };

    const cancelEdit = (index: number) => {
        setTigersFixtures(prev => prev.map((fixture, i) =>
            i === index
                ? { ...fixture, isEditing: false, hasChanges: false }
                : fixture
        ));
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
                <h3>Tigers Fixture Management</h3>
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
                                <h6 className="card-title">Season Summary</h6>
                                <p className="card-text mb-0">
                                    <strong>{tigersFixtures.length} Tigers fixtures</strong> found for {selectedSeason.monthStart} {selectedSeason.startYear} - {selectedSeason.monthEnd} {selectedSeason.endYear}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
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
                                <table className="table table-striped table-bordered">
                                    <thead className="table-dark">
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
                                    <tbody>
                                        {tigersFixtures.map((fixture, index) => (
                                            <tr key={fixture.fixtureId}>
                                                <td>
                                                    {fixture.date.toLocaleDateString('en-GB', {
                                                        weekday: 'short',
                                                        day: 'numeric',
                                                        month: 'short'
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
                                                                style={{ width: '50px' }}
                                                                min="0"
                                                                value={fixture.homeTeamScore}
                                                                onChange={(e) => updateFixture(index, 'homeTeamScore', parseInt(e.target.value) || 0)}
                                                            />
                                                            <span className="align-self-center">-</span>
                                                            <input
                                                                type="number"
                                                                className="form-control form-control-sm ms-1"
                                                                style={{ width: '50px' }}
                                                                min="0"
                                                                value={fixture.awayTeamScore}
                                                                onChange={(e) => updateFixture(index, 'awayTeamScore', parseInt(e.target.value) || 0)}
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
                                                            onChange={(e) => updateFixture(index, 'result', parseInt(e.target.value))}
                                                        >
                                                            {filteredResultOptions.map(option => (
                                                                <option key={option.key} value={option.key}>{option.value}</option>
                                                            ))}
                                                        </select>
                                                    ) : (
                                                        <span className={`badge ${
                                                            fixture.result === ResultType.Win ? 'bg-success' :
                                                            fixture.result === ResultType.Draw ? 'bg-warning' : 'bg-danger'
                                                        }`}>
                                                            {ResultType[fixture.result]}
                                                        </span>
                                                    )}
                                                </td>
                                                <td>
                                                    {fixture.isEditing ? (
                                                        <select
                                                            className="form-select form-select-sm"
                                                            value={fixture.location}
                                                            onChange={(e) => updateFixture(index, 'location', parseInt(e.target.value))}
                                                        >
                                                            {filteredLocationOptions.map(option => (
                                                                <option key={option.key} value={option.key}>{option.value}</option>
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
                                                            onChange={(e) => updateFixture(index, 'type', parseInt(e.target.value))}
                                                        >
                                                            {filteredGameTypeOptions.map(option => (
                                                                <option key={option.key} value={option.key}>{option.value}</option>
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
                                                                style={{ width: '50px' }}
                                                                min="0"
                                                                value={fixture.glsFor}
                                                                onChange={(e) => updateFixture(index, 'glsFor', parseInt(e.target.value) || 0)}
                                                            />
                                                            <span className="align-self-center">/</span>
                                                            <input
                                                                type="number"
                                                                className="form-control form-control-sm ms-1"
                                                                style={{ width: '50px' }}
                                                                min="0"
                                                                value={fixture.glsA}
                                                                onChange={(e) => updateFixture(index, 'glsA', parseInt(e.target.value) || 0)}
                                                            />
                                                        </div>
                                                    ) : (
                                                        `${fixture.glsFor} / ${fixture.glsA}`
                                                    )}
                                                </td>
                                                <td>
                                                    <span className={`badge ${
                                                        fixture.pts === 3 ? 'bg-success' :
                                                        fixture.pts === 1 ? 'bg-warning' : 'bg-secondary'
                                                    }`}>
                                                        {fixture.pts}
                                                    </span>
                                                </td>
                                                <td>
                                                    {fixture.isEditing ? (
                                                        <div className="btn-group" role="group">
                                                            <button
                                                                className="btn btn-success btn-sm"
                                                                onClick={() => saveFixture(index)}
                                                                disabled={loading || !fixture.hasChanges}
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

export default AdminTigersFixture;