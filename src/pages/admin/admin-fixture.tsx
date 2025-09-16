import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GetSeasons } from "../../services/season-service";
import { GetTeams } from "../../services/teams-service";
import { GetLeagueTable } from "../../services/league-table-service";
import { GetFixturesForSeason, PostBulkFixtures, PutFixture } from "../../services/fixture-service";
import { Season } from "../../objects/season";
import { Team } from "../../objects/team";
import { LeagueTable } from "../../objects/league-table";
import { FixtureDTO, BulkFixtureDTO } from "../../objects/fixture-dto";
import { Fixture } from "../../objects/fixture";

const AdminFixture = () => {
    const navigate = useNavigate();
    const [seasons, setSeasons] = useState<Season[]>([]);
    const [selectedSeason, setSelectedSeason] = useState<Season | null>(null);
    const [allTeams, setAllTeams] = useState<Team[]>([]);
    const [seasonTeams, setSeasonTeams] = useState<Team[]>([]);
    const [saturdays, setSaturdays] = useState<Date[]>([]);
    const [fixtures, setFixtures] = useState<{[key: string]: FixtureDTO[]}>({});
    const [existingFixtures, setExistingFixtures] = useState<Fixture[]>([]);
    const [feedback, setFeedback] = useState<{message: string, type: 'success' | 'error'} | null>(null);
    const [loading, setLoading] = useState(false);
    const [expandedDates, setExpandedDates] = useState<{[key: string]: boolean}>({});

    const monthToNumber = (monthName: string): number => {
        const months = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
        return months.indexOf(monthName);
    };

    const generateSaturdays = (season: Season): Date[] => {
        const startMonth = monthToNumber(season.monthStart);
        const endMonth = monthToNumber(season.monthEnd);
        const saturdays: Date[] = [];

        // Handle season that spans across years (e.g., September to May)
        const startYear = season.startYear;
        const endYear = endMonth < startMonth ? season.endYear : season.startYear;

        // Start from the first day of the start month
        const firstDayOfMonth = new Date(startYear, startMonth, 1);
        const dayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday, 6 = Saturday

        // Calculate days to add to get to first Saturday
        // If it's already Saturday (6), we want the same day
        // Otherwise, calculate days until next Saturday
        const daysUntilFirstSaturday = dayOfWeek === 6 ? 0 : (6 - dayOfWeek);

        let currentDate = new Date(startYear, startMonth, 1 + daysUntilFirstSaturday);
        const endDate = new Date(endYear, endMonth + 1, 0); // Last day of end month

        while (currentDate <= endDate) {
            saturdays.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 7); // Next Saturday
        }

        return saturdays;
    };

    const formatDate = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

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

    const loadExistingFixtures = async (seasonId: number) => {
        try {
            const existing = await GetFixturesForSeason(seasonId);
            setExistingFixtures(existing || []);

            // Group existing fixtures by date
            const groupedFixtures: {[key: string]: FixtureDTO[]} = {};
            (existing || []).forEach((fixture: Fixture) => {
                const dateKey = formatDate(new Date(fixture.date));
                if (!groupedFixtures[dateKey]) {
                    groupedFixtures[dateKey] = [];
                }

                const homeTeam = allTeams.find(t => t.id === fixture.homeTeamId);
                const awayTeam = allTeams.find(t => t.id === fixture.awayTeamId);

                groupedFixtures[dateKey].push({
                    id: fixture.id,
                    homeTeamId: fixture.homeTeamId,
                    homeTeam: homeTeam?.name,
                    awayTeamId: fixture.awayTeamId,
                    awayTeam: awayTeam?.name,
                    homeTeamScore: fixture.homeTeamScore,
                    awayTeamScore: fixture.awayTeamScore,
                    date: new Date(fixture.date),
                    seasonId: fixture.seasonId,
                    knownScore: fixture.homeTeamScore > 0 || fixture.awayTeamScore > 0
                });
            });

            setFixtures(groupedFixtures);
        } catch (error) {
            console.error("Error loading existing fixtures:", error);
        }
    };

    const handleSeasonChange = async (seasonId: number) => {
        const season = seasons.find(s => s.id === seasonId);
        if (!season) return;

        setSelectedSeason(season);
        setLoading(true);

        try {
            await loadTeamsForSeason(seasonId);
            const generatedSaturdays = generateSaturdays(season);
            setSaturdays(generatedSaturdays);
            await loadExistingFixtures(seasonId);
        } finally {
            setLoading(false);
        }
    };

    const addFixtureToDate = (dateKey: string) => {
        const newFixture: FixtureDTO = {
            id: 0,
            homeTeamId: 0,
            homeTeam: '',
            awayTeamId: 0,
            awayTeam: '',
            homeTeamScore: 0,
            awayTeamScore: 0,
            date: new Date(dateKey),
            seasonId: selectedSeason?.id || 0,
            knownScore: false
        };

        setFixtures(prev => ({
            ...prev,
            [dateKey]: [...(prev[dateKey] || []), newFixture]
        }));
    };

    const updateFixture = (dateKey: string, index: number, field: keyof FixtureDTO, value: any) => {
        setFixtures(prev => {
            const dateFixtures = [...(prev[dateKey] || [])];
            const fixture = { ...dateFixtures[index] };

            if (field === 'homeTeamId') {
                fixture.homeTeamId = parseInt(value);
                fixture.homeTeam = seasonTeams.find(t => t.id === parseInt(value))?.name || '';
            } else if (field === 'awayTeamId') {
                fixture.awayTeamId = parseInt(value);
                fixture.awayTeam = seasonTeams.find(t => t.id === parseInt(value))?.name || '';
            } else if (field === 'date') {
                fixture.date = new Date(value);
            } else {
                (fixture as any)[field] = value;
            }

            dateFixtures[index] = fixture;

            return {
                ...prev,
                [dateKey]: dateFixtures
            };
        });
    };

    const removeFixture = (dateKey: string, index: number) => {
        setFixtures(prev => {
            const dateFixtures = [...(prev[dateKey] || [])];
            dateFixtures.splice(index, 1);

            return {
                ...prev,
                [dateKey]: dateFixtures
            };
        });
    };

    const toggleDateExpansion = (dateKey: string) => {
        setExpandedDates(prev => ({
            ...prev,
            [dateKey]: !prev[dateKey]
        }));
    };

    const saveAllFixtures = async () => {
        if (!selectedSeason) return;

        setLoading(true);
        try {
            const allFixtures: FixtureDTO[] = [];

            Object.values(fixtures).forEach(dateFixtures => {
                dateFixtures.forEach(fixture => {
                    if (fixture.homeTeamId > 0 && fixture.awayTeamId > 0 && fixture.homeTeamId !== fixture.awayTeamId) {
                        allFixtures.push({
                            ...fixture,
                            seasonId: selectedSeason.id
                        });
                    }
                });
            });

            if (allFixtures.length > 0) {
                const bulkFixtures: BulkFixtureDTO = { fixtures: allFixtures };
                await PostBulkFixtures(bulkFixtures);

                setFeedback({message: `${allFixtures.length} fixtures saved successfully!`, type: 'success'});
                await loadExistingFixtures(selectedSeason.id);
            } else {
                setFeedback({message: 'No valid fixtures to save.', type: 'error'});
            }

            setTimeout(() => setFeedback(null), 3000);
        } catch (error) {
            console.error("Error saving fixtures:", error);
            setFeedback({message: 'Error saving fixtures. Please try again.', type: 'error'});
            setTimeout(() => setFeedback(null), 3000);
        } finally {
            setLoading(false);
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
                <h3>Bulk Fixture Management</h3>
                <div>
                    <button
                        className="btn btn-secondary me-2"
                        onClick={() => navigate('/Admin')}
                    >
                        Back to Admin
                    </button>
                    <button
                        className="btn btn-success"
                        onClick={saveAllFixtures}
                        disabled={loading || !selectedSeason}
                    >
                        {loading ? 'Saving...' : 'Save All Fixtures'}
                    </button>
                </div>
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
                                <h6 className="card-title">Season Details</h6>
                                <p className="card-text mb-1">
                                    <strong>Period:</strong> {selectedSeason.monthStart} {selectedSeason.startYear} - {selectedSeason.monthEnd} {selectedSeason.endYear}
                                </p>
                                <p className="card-text mb-1">
                                    <strong>Teams:</strong> {seasonTeams.length} teams in this season
                                </p>
                                <p className="card-text mb-0">
                                    <strong>Saturdays:</strong> {saturdays.length} available match dates
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Fixture Grid */}
            {selectedSeason && (
                <div className="row">
                    <div className="col-12">
                        <h5>Fixture Schedule</h5>
                        {loading ? (
                            <div className="text-center py-4">
                                <div className="spinner-border" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            </div>
                        ) : (
                            <div className="accordion" id="fixtureAccordion">
                                {saturdays.map((saturday, index) => {
                                    const dateKey = formatDate(saturday);
                                    const dateFixtures = fixtures[dateKey] || [];
                                    const isExpanded = expandedDates[dateKey] || false;

                                    return (
                                        <div key={dateKey} className="accordion-item">
                                            <h6 className="accordion-header">
                                                <button
                                                    className={`accordion-button ${isExpanded ? '' : 'collapsed'}`}
                                                    type="button"
                                                    onClick={() => toggleDateExpansion(dateKey)}
                                                    aria-expanded={isExpanded}
                                                >
                                                    <div className="d-flex justify-content-between w-100 me-3">
                                                        <span>
                                                            {saturday.toLocaleDateString('en-GB', {
                                                                weekday: 'long',
                                                                year: 'numeric',
                                                                month: 'long',
                                                                day: 'numeric'
                                                            })}
                                                        </span>
                                                        <span className="badge bg-primary">
                                                            {dateFixtures.length} fixture{dateFixtures.length !== 1 ? 's' : ''}
                                                        </span>
                                                    </div>
                                                </button>
                                            </h6>
                                            <div className={`accordion-collapse ${isExpanded ? 'collapse show' : 'collapse'}`}>
                                                <div className="accordion-body">
                                                    {dateFixtures.map((fixture, fixtureIndex) => (
                                                        <div key={fixtureIndex} className="card mb-2">
                                                            <div className="card-body">
                                                                <div className="row align-items-center">
                                                                    <div className="col-md-3">
                                                                        <label className="form-label">Home Team</label>
                                                                        <select
                                                                            className="form-select form-select-sm"
                                                                            value={fixture.homeTeamId}
                                                                            onChange={(e) => updateFixture(dateKey, fixtureIndex, 'homeTeamId', e.target.value)}
                                                                        >
                                                                            <option value={0}>Select Home Team</option>
                                                                            {seasonTeams.map(team => (
                                                                                <option key={team.id} value={team.id}>{team.name}</option>
                                                                            ))}
                                                                        </select>
                                                                    </div>
                                                                    <div className="col-md-1 text-center">
                                                                        <strong>vs</strong>
                                                                    </div>
                                                                    <div className="col-md-3">
                                                                        <label className="form-label">Away Team</label>
                                                                        <select
                                                                            className="form-select form-select-sm"
                                                                            value={fixture.awayTeamId}
                                                                            onChange={(e) => updateFixture(dateKey, fixtureIndex, 'awayTeamId', e.target.value)}
                                                                        >
                                                                            <option value={0}>Select Away Team</option>
                                                                            {seasonTeams.map(team => (
                                                                                <option key={team.id} value={team.id}>{team.name}</option>
                                                                            ))}
                                                                        </select>
                                                                    </div>
                                                                    <div className="col-md-2">
                                                                        <label className="form-label">Date</label>
                                                                        <input
                                                                            type="date"
                                                                            className="form-control form-control-sm"
                                                                            value={formatDate(fixture.date)}
                                                                            onChange={(e) => updateFixture(dateKey, fixtureIndex, 'date', e.target.value)}
                                                                        />
                                                                    </div>
                                                                    <div className="col-md-2">
                                                                        <label className="form-label">Score (if known)</label>
                                                                        <div className="d-flex">
                                                                            <input
                                                                                type="number"
                                                                                className="form-control form-control-sm me-1"
                                                                                placeholder="H"
                                                                                min="0"
                                                                                value={fixture.homeTeamScore}
                                                                                onChange={(e) => updateFixture(dateKey, fixtureIndex, 'homeTeamScore', parseInt(e.target.value) || 0)}
                                                                            />
                                                                            <input
                                                                                type="number"
                                                                                className="form-control form-control-sm"
                                                                                placeholder="A"
                                                                                min="0"
                                                                                value={fixture.awayTeamScore}
                                                                                onChange={(e) => updateFixture(dateKey, fixtureIndex, 'awayTeamScore', parseInt(e.target.value) || 0)}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                    <div className="col-md-1">
                                                                        <button
                                                                            className="btn btn-outline-danger btn-sm mt-4"
                                                                            onClick={() => removeFixture(dateKey, fixtureIndex)}
                                                                            title="Remove fixture"
                                                                        >
                                                                            ×
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}

                                                    <button
                                                        className="btn btn-outline-primary btn-sm"
                                                        onClick={() => addFixtureToDate(dateKey)}
                                                    >
                                                        + Add Fixture for this Date
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminFixture;