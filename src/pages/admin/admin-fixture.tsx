import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GetSeasons } from "../../services/season-service";
import { GetTeams } from "../../services/teams-service";
import { GetLeagueTable } from "../../services/league-table-service";
import {
  GetFixturesForSeason,
  PostBulkFixtures,
  PutFixture,
  DeleteFixture,
} from "../../services/fixture-service";
import {
  GetTigersFixturesForSeason,
  PostTigersFixture,
  DeleteTigersFixture,
} from "../../services/tigers-fixture-service";
import { Season } from "../../objects/season";
import { Team } from "../../objects/team";
import { LeagueTable } from "../../objects/league-table";
import { FixtureDTO, BulkFixtureDTO } from "../../objects/fixture-dto";
import { Fixture } from "../../objects/fixture";
import { TigersFixture } from "../../objects/tigers-fixture";
import { GameType } from "../../objects/enums/game-type";

const AdminFixture = () => {
  const navigate = useNavigate();
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<Season | null>(null);
  const [allTeams, setAllTeams] = useState<Team[]>([]);
  const [seasonTeams, setSeasonTeams] = useState<Team[]>([]);
  const [saturdays, setSaturdays] = useState<Date[]>([]);
  const [fixtures, setFixtures] = useState<{ [key: string]: FixtureDTO[] }>({});
  const [existingFixtures, setExistingFixtures] = useState<Fixture[]>([]);
  const [feedback, setFeedback] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedDates, setExpandedDates] = useState<{
    [key: string]: boolean;
  }>({});

  const monthToNumber = (monthName: string): number => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
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
    const daysUntilFirstSaturday = dayOfWeek === 6 ? 0 : 6 - dayOfWeek;

    let currentDate = new Date(
      startYear,
      startMonth,
      1 + daysUntilFirstSaturday,
    );
    const endDate = new Date(endYear, endMonth + 1, 0); // Last day of end month

    while (currentDate <= endDate) {
      saturdays.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 7); // Next Saturday
    }

    return saturdays;
  };

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const loadTeamsForSeason = async (seasonId: number) => {
    try {
      const leagueTable = await GetLeagueTable(seasonId);
      if (leagueTable && leagueTable.length > 0) {
        const teamIds = leagueTable.map((entry: LeagueTable) => entry.teamId);
        const teamsInSeason = allTeams.filter((team) =>
          teamIds.includes(team.id),
        );
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
      // Load both league fixtures and friendly fixtures
      const [leagueFixtures, tigersFixtures] = await Promise.all([
        GetFixturesForSeason(seasonId),
        GetTigersFixturesForSeason(seasonId),
      ]);

      setExistingFixtures(leagueFixtures || []);

      // Group existing fixtures by date
      const groupedFixtures: { [key: string]: FixtureDTO[] } = {};

      // Process league fixtures
      (leagueFixtures || []).forEach((fixture: Fixture) => {
        const dateKey = formatDate(new Date(fixture.date));
        if (!groupedFixtures[dateKey]) {
          groupedFixtures[dateKey] = [];
        }

        const homeTeam = allTeams.find((t) => t.id === fixture.homeTeamId);
        const awayTeam = allTeams.find((t) => t.id === fixture.awayTeamId);

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
          knownScore: fixture.homeTeamScore > 0 || fixture.awayTeamScore > 0,
          gameType: GameType.League,
        });
      });

      // Process Tigers fixtures (friendlies)
      (tigersFixtures || []).forEach((fixture: TigersFixture) => {
        if (fixture.type === 1) { // Only friendlies
          const dateKey = formatDate(new Date(fixture.date));
          if (!groupedFixtures[dateKey]) {
            groupedFixtures[dateKey] = [];
          }

          // Determine if Tigers is home or away based on location
          const isHome = fixture.location === 0; // Assuming 0 is Home

          groupedFixtures[dateKey].push({
            id: fixture.id,
            homeTeamId: isHome ? 1 : 999, // Use 999 as placeholder for opposition
            homeTeam: fixture.homeTeam,
            awayTeamId: isHome ? 999 : 1,
            awayTeam: fixture.awayTeam,
            homeTeamScore: fixture.homeTeamScore,
            awayTeamScore: fixture.awayTeamScore,
            date: new Date(fixture.date),
            seasonId: fixture.seasonId,
            knownScore: fixture.homeTeamScore > 0 || fixture.awayTeamScore > 0,
            gameType: GameType.Friendly,
          });
        }
      });

      setFixtures(groupedFixtures);
    } catch (error) {
      console.error("Error loading existing fixtures:", error);
    }
  };

  const handleSeasonChange = async (seasonId: number) => {
    const season = seasons.find((s) => s.id === seasonId);
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

  const addFixtureToDate = (dateKey: string, gameType: GameType = GameType.League) => {
    // Parse the date string properly to avoid timezone issues
    const [year, month, day] = dateKey.split('-').map(Number);
    const fixtureDate = new Date(year, month - 1, day); // month is 0-indexed

    const newFixture: FixtureDTO = {
      id: 0,
      homeTeamId: gameType === GameType.Friendly ? 1 : 0, // Tigers is TeamId 1
      homeTeam: gameType === GameType.Friendly ? "Tigers" : "",
      awayTeamId: 0,
      awayTeam: "",
      homeTeamScore: 0,
      awayTeamScore: 0,
      date: fixtureDate,
      seasonId: selectedSeason?.id || 0,
      knownScore: false,
      gameType: gameType,
    };

    setFixtures((prev) => ({
      ...prev,
      [dateKey]: [...(prev[dateKey] || []), newFixture],
    }));
  };

  const updateFixture = (
    dateKey: string,
    index: number,
    field: keyof FixtureDTO,
    value: any,
  ) => {
    setFixtures((prev) => {
      const dateFixtures = [...(prev[dateKey] || [])];
      const fixture = { ...dateFixtures[index] };

      if (field === "homeTeamId") {
        fixture.homeTeamId = parseInt(value);
        // For friendlies, look up from all teams; for league, from season teams
        const teamsList = fixture.gameType === GameType.Friendly ? allTeams : seasonTeams;
        fixture.homeTeam = teamsList.find((t) => t.id === parseInt(value))?.name || "";
      } else if (field === "awayTeamId") {
        fixture.awayTeamId = parseInt(value);
        // For friendlies, look up from all teams; for league, from season teams
        const teamsList = fixture.gameType === GameType.Friendly ? allTeams : seasonTeams;
        fixture.awayTeam = teamsList.find((t) => t.id === parseInt(value))?.name || "";
      } else if (field === "date") {
        // Parse the date string properly to avoid timezone issues
        const [year, month, day] = value.split('-').map(Number);
        fixture.date = new Date(year, month - 1, day);
      } else {
        (fixture as any)[field] = value;
      }

      dateFixtures[index] = fixture;

      return {
        ...prev,
        [dateKey]: dateFixtures,
      };
    });
  };

  const removeFixture = async (dateKey: string, index: number) => {
    const fixture = fixtures[dateKey][index];

    // Only delete from database if it has an ID (exists in DB)
    if (fixture.id > 0) {
      try {
        if (fixture.gameType === GameType.Friendly) {
          // Delete from TigersFixtures table
          await DeleteTigersFixture(fixture.id);
        } else {
          // Delete from regular Fixtures table
          await DeleteFixture(fixture.id);

          // Also check if it's a Tigers league game that needs to be deleted from TigersFixtures
          if (fixture.homeTeamId === 1 || fixture.awayTeamId === 1) {
            // Find and delete corresponding TigersFixture
            // Note: We'd need to find the TigersFixture ID that matches this fixture
            // This is a limitation - we might need to search TigersFixtures by date/teams
            const tigersFixtures = await GetTigersFixturesForSeason(selectedSeason?.id);
            const matchingTigersFixture = tigersFixtures?.find((tf: TigersFixture) => {
              const tfDate = new Date(tf.date);
              const fixtureDate = new Date(fixture.date);
              return tfDate.toDateString() === fixtureDate.toDateString() &&
                     tf.type === 0; // League game
            });

            if (matchingTigersFixture) {
              await DeleteTigersFixture(matchingTigersFixture.id);
            }
          }
        }

        setFeedback({
          message: "Fixture deleted successfully!",
          type: "success",
        });
        setTimeout(() => setFeedback(null), 3000);
      } catch (error) {
        console.error("Error deleting fixture:", error);
        setFeedback({
          message: "Error deleting fixture. Please try again.",
          type: "error",
        });
        setTimeout(() => setFeedback(null), 3000);
        return; // Don't remove from UI if delete failed
      }
    }

    // Remove from UI state
    setFixtures((prev) => {
      const dateFixtures = [...(prev[dateKey] || [])];
      dateFixtures.splice(index, 1);

      return {
        ...prev,
        [dateKey]: dateFixtures,
      };
    });
  };

  const toggleDateExpansion = (dateKey: string) => {
    setExpandedDates((prev) => ({
      ...prev,
      [dateKey]: !prev[dateKey],
    }));
  };

  const saveIndividualFixture = async (dateKey: string, index: number) => {
    const fixture = fixtures[dateKey][index];

    if (!selectedSeason) {
      setFeedback({
        message: "Please select a season first.",
        type: "error",
      });
      setTimeout(() => setFeedback(null), 3000);
      return;
    }

    if (!fixture.homeTeamId || !fixture.awayTeamId || fixture.homeTeamId === fixture.awayTeamId) {
      setFeedback({
        message: "Please select both home and away teams.",
        type: "error",
      });
      setTimeout(() => setFeedback(null), 3000);
      return;
    }

    setLoading(true);
    let savedFixtureId = fixture.id;

    try {
      if (fixture.gameType === GameType.Friendly) {
        // Save friendly to TigersFixtures
        const isHome = fixture.homeTeamId === 1;

        // Calculate result based on scores
        let result = 0; // Draw
        if (fixture.homeTeamScore > fixture.awayTeamScore) {
          result = isHome ? 1 : 2; // 1 = Win, 2 = Loss
        } else if (fixture.homeTeamScore < fixture.awayTeamScore) {
          result = isHome ? 2 : 1;
        }

        const tigersFixtureDTO: any = {
          homeTeam: fixture.homeTeamId.toString(),
          awayTeam: fixture.awayTeamId.toString(),
          homeTeamScore: fixture.homeTeamScore,
          awayTeamScore: fixture.awayTeamScore,
          date: fixture.date,
          result: result,
          location: isHome ? 0 : 1, // 0 = Home, 1 = Away
          seasonId: selectedSeason.id,
          type: 1, // Friendly
          glsFor: isHome ? fixture.homeTeamScore : fixture.awayTeamScore,
          glsA: isHome ? fixture.awayTeamScore : fixture.homeTeamScore,
        };

        await PostTigersFixture(tigersFixtureDTO);
      } else {
        // Save league fixture
        const leagueFixture: FixtureDTO = {
          ...fixture,
          seasonId: selectedSeason.id,
          knownScore: fixture.homeTeamScore > 0 || fixture.awayTeamScore > 0,
        };

        if (fixture.id > 0) {
          // Existing fixture - use PUT to update (this will update league table if scores changed)
          await PutFixture(leagueFixture);
        } else {
          // New fixture - use POST
          const bulkFixtures: BulkFixtureDTO = { fixtures: [leagueFixture] };
          const response = await PostBulkFixtures(bulkFixtures);

          // Update the saved fixture ID if available
          if (response && response.length > 0) {
            savedFixtureId = response[0].id;
          } else {
            savedFixtureId = Date.now(); // Fallback temporary ID
          }
        }

        // If Tigers is involved, also save to TigersFixtures
        if (fixture.homeTeamId === 1 || fixture.awayTeamId === 1) {
          const isHome = fixture.homeTeamId === 1;

          let result = 0;
          if (fixture.homeTeamScore > fixture.awayTeamScore) {
            result = isHome ? 1 : 2;
          } else if (fixture.homeTeamScore < fixture.awayTeamScore) {
            result = isHome ? 2 : 1;
          }

          const tigersFixtureDTO: any = {
            homeTeam: fixture.homeTeamId.toString(),
            awayTeam: fixture.awayTeamId.toString(),
            homeTeamScore: fixture.homeTeamScore,
            awayTeamScore: fixture.awayTeamScore,
            date: fixture.date,
            result: result,
            location: isHome ? 0 : 1,
            seasonId: selectedSeason.id,
            type: 0, // League game
            glsFor: isHome ? fixture.homeTeamScore : fixture.awayTeamScore,
            glsA: isHome ? fixture.awayTeamScore : fixture.homeTeamScore,
          };

          await PostTigersFixture(tigersFixtureDTO);
        }
      }

      // Mark fixture as saved by updating its ID and knownScore
      setFixtures((prev) => {
        const dateFixtures = [...(prev[dateKey] || [])];
        const updatedFixture = { ...dateFixtures[index] };

        updatedFixture.id = savedFixtureId || Date.now();
        updatedFixture.knownScore = fixture.homeTeamScore > 0 || fixture.awayTeamScore > 0;
        dateFixtures[index] = updatedFixture;

        return {
          ...prev,
          [dateKey]: dateFixtures,
        };
      });

      setFeedback({
        message: "Fixture saved successfully!",
        type: "success",
      });
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
  }, []);

  return (
    <div className="container-fluid">
      {/* Modern Compact Header - Responsive */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center align-items-md-center mb-3 p-3 bg-light rounded">
        <div className="text-center text-md-start mb-3 mb-md-0">
          <h5 className="mb-0 text-success fw-bold">
            <i className="bi bi-calendar-event me-2"></i>
            Fixture Management
          </h5>
          <small className="text-muted">
            Create and manage fixtures - save each one individually
          </small>
        </div>
        <div className="d-flex gap-2">
          <button
            className="btn btn-secondary"
            onClick={() => navigate("/Admin")}
          >
            <i className="bi bi-arrow-left me-1"></i>
            Back to Admin
          </button>
        </div>
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
            Choose the season to manage fixtures for
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
                  <div className="row">
                    <div className="col-md-4">
                      <strong>Period:</strong><br/>
                      {selectedSeason.monthStart} {selectedSeason.startYear} - {selectedSeason.monthEnd} {selectedSeason.endYear}
                    </div>
                    <div className="col-md-4">
                      <strong>Teams:</strong><br/>
                      {seasonTeams.length} teams in season
                    </div>
                    <div className="col-md-4">
                      <strong>Match Dates:</strong><br/>
                      {saturdays.length} Saturdays available
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
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
                          className={`accordion-button ${isExpanded ? "" : "collapsed"}`}
                          type="button"
                          onClick={() => toggleDateExpansion(dateKey)}
                          aria-expanded={isExpanded}
                        >
                          <div className="d-flex justify-content-between w-100 me-3">
                            <span>
                              {saturday.toLocaleDateString("en-GB", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </span>
                            <span className="badge bg-primary">
                              {dateFixtures.length} fixture
                              {dateFixtures.length !== 1 ? "s" : ""}
                            </span>
                          </div>
                        </button>
                      </h6>
                      <div
                        className={`accordion-collapse ${isExpanded ? "collapse show" : "collapse"}`}
                      >
                        <div className="accordion-body">
                          {dateFixtures.map((fixture, fixtureIndex) => (
                            <div key={fixtureIndex} className={`card mb-2 ${fixture.gameType === GameType.Friendly ? 'border-success' : ''}`}>
                              <div className="card-body">
                                {fixture.gameType === GameType.Friendly && (
                                  <span className="badge bg-success position-absolute top-0 end-0 m-2">
                                    Friendly
                                  </span>
                                )}
                                <div className="row align-items-center">
                                  <div className="col-md-3">
                                    <label className="form-label">
                                      Home Team
                                    </label>
                                    {fixture.gameType === GameType.Friendly ? (
                                      <select
                                        className="form-select form-select-sm"
                                        value={fixture.homeTeamId}
                                        onChange={(e) =>
                                          updateFixture(
                                            dateKey,
                                            fixtureIndex,
                                            "homeTeamId",
                                            e.target.value,
                                          )
                                        }
                                      >
                                        <option value={0}>
                                          Select Home Team
                                        </option>
                                        {allTeams.map((team) => (
                                          <option key={team.id} value={team.id}>
                                            {team.name}
                                          </option>
                                        ))}
                                      </select>
                                    ) : (
                                      <select
                                        className="form-select form-select-sm"
                                        value={fixture.homeTeamId}
                                        onChange={(e) =>
                                          updateFixture(
                                            dateKey,
                                            fixtureIndex,
                                            "homeTeamId",
                                            e.target.value,
                                          )
                                        }
                                      >
                                        <option value={0}>
                                          Select Home Team
                                        </option>
                                        {seasonTeams.map((team) => (
                                          <option key={team.id} value={team.id}>
                                            {team.name}
                                          </option>
                                        ))}
                                      </select>
                                    )}
                                  </div>
                                  <div className="col-md-1 text-center">
                                    <strong>vs</strong>
                                  </div>
                                  <div className="col-md-3">
                                    <label className="form-label">
                                      Away Team
                                    </label>
                                    {fixture.gameType === GameType.Friendly ? (
                                      <select
                                        className="form-select form-select-sm"
                                        value={fixture.awayTeamId}
                                        onChange={(e) =>
                                          updateFixture(
                                            dateKey,
                                            fixtureIndex,
                                            "awayTeamId",
                                            e.target.value,
                                          )
                                        }
                                      >
                                        <option value={0}>
                                          Select Away Team
                                        </option>
                                        {allTeams.map((team) => (
                                          <option key={team.id} value={team.id}>
                                            {team.name}
                                          </option>
                                        ))}
                                      </select>
                                    ) : (
                                      <select
                                        className="form-select form-select-sm"
                                        value={fixture.awayTeamId}
                                        onChange={(e) =>
                                          updateFixture(
                                            dateKey,
                                            fixtureIndex,
                                            "awayTeamId",
                                            e.target.value,
                                          )
                                        }
                                      >
                                        <option value={0}>
                                          Select Away Team
                                        </option>
                                        {seasonTeams.map((team) => (
                                          <option key={team.id} value={team.id}>
                                            {team.name}
                                          </option>
                                        ))}
                                      </select>
                                    )}
                                  </div>
                                  <div className="col-md-2">
                                    <label className="form-label">Date</label>
                                    <input
                                      type="date"
                                      className="form-control form-control-sm"
                                      value={formatDate(fixture.date)}
                                      onChange={(e) =>
                                        updateFixture(
                                          dateKey,
                                          fixtureIndex,
                                          "date",
                                          e.target.value,
                                        )
                                      }
                                    />
                                  </div>
                                  <div className="col-md-2">
                                    <label className="form-label">
                                      Score (if known)
                                    </label>
                                    <div className="d-flex">
                                      <input
                                        type="number"
                                        className="form-control form-control-sm me-1"
                                        placeholder="H"
                                        min="0"
                                        value={fixture.homeTeamScore}
                                        onChange={(e) =>
                                          updateFixture(
                                            dateKey,
                                            fixtureIndex,
                                            "homeTeamScore",
                                            parseInt(e.target.value) || 0,
                                          )
                                        }
                                      />
                                      <input
                                        type="number"
                                        className="form-control form-control-sm"
                                        placeholder="A"
                                        min="0"
                                        value={fixture.awayTeamScore}
                                        onChange={(e) =>
                                          updateFixture(
                                            dateKey,
                                            fixtureIndex,
                                            "awayTeamScore",
                                            parseInt(e.target.value) || 0,
                                          )
                                        }
                                      />
                                    </div>
                                  </div>
                                  <div className="col-md-1">
                                    <div className="d-flex flex-column gap-1 mt-4">
                                      <button
                                        className={`btn btn-sm ${fixture.id > 0 ? 'btn-outline-success' : 'btn-success'}`}
                                        onClick={() =>
                                          saveIndividualFixture(dateKey, fixtureIndex)
                                        }
                                        title={fixture.id > 0 ? "Fixture saved" : "Save fixture"}
                                        disabled={loading}
                                      >
                                        {fixture.id > 0 ? '✓' : '💾'}
                                      </button>
                                      <button
                                        className="btn btn-outline-danger btn-sm"
                                        onClick={() =>
                                          removeFixture(dateKey, fixtureIndex)
                                        }
                                        title="Remove fixture"
                                      >
                                        ×
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}

                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-outline-primary btn-sm"
                              onClick={() => addFixtureToDate(dateKey, GameType.League)}
                            >
                              <i className="bi bi-trophy me-1"></i>
                              Add League Fixture
                            </button>
                            <button
                              className="btn btn-outline-success btn-sm"
                              onClick={() => addFixtureToDate(dateKey, GameType.Friendly)}
                            >
                              <i className="bi bi-people me-1"></i>
                              Add Friendly
                            </button>
                          </div>
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
