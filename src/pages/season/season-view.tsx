import "./season-styles.css";
import { useParams } from "react-router-dom";
import { GetTigersFixturesForSeason } from "../../services/tigers-fixture-service";
import { useEffect, useState } from "react";
import { TigersFixture } from "../../objects/tigers-fixture";
import FixtureTable from "../../components/tigers-fixture/tigers-fixture-table";
import { GameType } from "../../objects/enums/enums";
import { GetSeasonGameStats } from "../../services/game-stat-service";
import { GameStat } from "../../objects/game-stat";
import GameStatTable from "../../components/game-stats/game-stat-table";
import { LeagueTable } from "../../objects/league-table";
import { GetLeagueTable } from "../../services/league-table-service";
import LeagueTableComponent from "../../components/league-table/league-table";
import { GetSeasonFantasyStats } from "../../services/fantasy-stat-service";
import { FantasyStat } from "../../objects/fantasy-stat";
import FantasyStatTable from "../../components/fantasy/fantasy-stat-table";
import { GetSeason } from "../../services/season-service";
import { Season } from "../../objects/season";
import ButtonAtom from "../../atoms/button/button-atom";
import FixtureList from "../../components/fixtures/fixture-list";

export default function SeasonView() {
  const param = useParams();
  const [fixtures, setFixtures] = useState<TigersFixture[] | null>(null);
  const [currentSeason, setSeason] = useState<Season | null>(null);
  const [gameStats, setGameStats] = useState<GameStat[] | null>(null);
  const [leagueTable, setLeagueTable] = useState<LeagueTable[] | null>(null);
  const [fantasyStats, setFantasyStats] = useState<FantasyStat[] | null>(null);
  const [viewDetails, setViewDetails] = useState(true);
  const [viewGrid, setViewGrid] = useState(false);
  const [viewStats, setViewStats] = useState(false);
  const [viewFantasy, setViewFantasy] = useState(false);

  useEffect(() => {
    GetTigersFixturesForSeason(param.id).then((fixture) =>
      setFixtures(fixture),
    );
    GetSeasonGameStats(param.id).then((gameStats) => setGameStats(gameStats));
    GetLeagueTable(param.id).then((leagueTable) => setLeagueTable(leagueTable));
    GetSeasonFantasyStats(param.id).then((fantasyStats) =>
      setFantasyStats(fantasyStats),
    );
    GetSeason(param.id).then((currentSeason) => setSeason(currentSeason));
  }, [param.id]);

  const handleSideBarItemClick = (index: any) => {
    switch (index) {
      case 0:
        setViewDetails(true);
        setViewGrid(false);
        setViewStats(false);
        setViewFantasy(false);
        break;

      case 1:
        setViewDetails(false);
        setViewGrid(false);
        setViewStats(true);
        setViewFantasy(false);
        break;

      case 2:
        setViewDetails(false);
        setViewGrid(true);
        setViewStats(false);
        setViewFantasy(false);
        break;

      case 3:
        setViewDetails(false);
        setViewGrid(false);
        setViewStats(false);
        setViewFantasy(true);
        break;
    }
  };

  return (
    <>
      <div className="container-fluid g-0">
        <div className="row g-0">
          <div className="col-12">
            {fixtures ? (
              <>
                <div className="container-fluid">
                  {/* Modern Compact Header - Responsive */}
                  <div className="d-flex flex-column flex-md-row justify-content-between align-items-center align-items-md-center mb-3 p-3 bg-light rounded">
                    <div className="text-center text-md-start mb-3 mb-md-0">
                      <h5 className="mb-0 text-success fw-bold">
                        U{currentSeason?.ageGroup}'s Division{" "}
                        {currentSeason?.division}
                      </h5>
                      <small className="text-muted">
                        {currentSeason?.monthStart} to {currentSeason?.monthEnd}
                      </small>
                    </div>

                    {/* Modern Tab Navigation */}
                    <div className="d-flex gap-1 justify-content-center">
                      <ButtonAtom
                        label="League"
                        clickHandler={() => handleSideBarItemClick(0)}
                        isActive={viewDetails}
                      ></ButtonAtom>
                      <ButtonAtom
                        label="Fixtures"
                        clickHandler={() => handleSideBarItemClick(2)}
                        isActive={viewGrid}
                      ></ButtonAtom>
                      <ButtonAtom
                        label="Stats"
                        clickHandler={() => handleSideBarItemClick(1)}
                        isActive={viewStats}
                      ></ButtonAtom>
                      <ButtonAtom
                        label="Fantasy"
                        clickHandler={() => handleSideBarItemClick(3)}
                        isActive={viewFantasy}
                      ></ButtonAtom>
                    </div>
                  </div>

                  {/* League Table */}
                  {viewDetails && (
                    <div className="card shadow-sm mb-4">
                      <div className="card-header bg-light border-bottom">
                        <h6 className="mb-0 text-success fw-semibold">
                          <i className="bi bi-table me-2"></i>
                          League Table
                        </h6>
                        <small className="text-muted">
                          Current season standings
                        </small>
                      </div>
                      <div className="card-body p-0">
                        {leagueTable ? (
                          leagueTable.length > 0 ? (
                            <LeagueTableComponent
                              leagueTableRows={leagueTable}
                            ></LeagueTableComponent>
                          ) : (
                            <div className="text-center p-4 text-muted">
                              No league data available
                            </div>
                          )
                        ) : (
                          <div className="text-center p-4">
                            <div
                              className="spinner-border text-success"
                              role="status"
                            >
                              <span className="visually-hidden">
                                Loading...
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Tigers Results */}
                  {viewDetails && (
                    <div className="card shadow-sm mb-4">
                      <div className="card-header bg-light border-bottom">
                        <h6 className="mb-0 text-success fw-semibold">
                          <i className="bi bi-trophy-fill me-2"></i>
                          Tigers Results
                        </h6>
                        <small className="text-muted">
                          Click a row to see match details
                        </small>
                      </div>
                      <div className="card-body p-0">
                        <FixtureTable
                          fixtures={fixtures}
                          gameType={GameType.Any}
                        ></FixtureTable>
                      </div>
                    </div>
                  )}

                  {/* Team Stats */}
                  {viewStats && (
                    <div className="card shadow-sm mb-4">
                      <div className="card-header bg-light border-bottom">
                        <h6 className="mb-0 text-success fw-semibold">
                          <i className="bi bi-graph-up me-2"></i>
                          Player Statistics
                        </h6>
                        <small className="text-muted">
                          Season performance data
                        </small>
                      </div>
                      <div className="card-body p-0">
                        {gameStats ? (
                          gameStats.length > 0 ? (
                            <GameStatTable
                              gameStats={gameStats}
                            ></GameStatTable>
                          ) : (
                            <div className="text-center p-4 text-muted">
                              No stats available
                            </div>
                          )
                        ) : (
                          <div className="text-center p-4">
                            <div
                              className="spinner-border text-success"
                              role="status"
                            >
                              <span className="visually-hidden">
                                Loading...
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Fixtures */}
                  {viewGrid && (
                    <div className="card shadow-sm mb-4">
                      <div className="card-header bg-light border-bottom">
                        <h6 className="mb-0 text-success fw-semibold">
                          <i className="bi bi-calendar-event me-2"></i>
                          Season Fixtures
                        </h6>
                        <small className="text-muted">
                          All matches organized by date
                        </small>
                      </div>
                      <div className="card-body p-0">
                        <FixtureList
                          seasonId={param.id}
                          date={new Date()}
                        ></FixtureList>
                      </div>
                    </div>
                  )}

                  {/* Fantasy Stats */}
                  {viewFantasy && (
                    <div className="card shadow-sm mb-4">
                      <div className="card-header bg-light border-bottom">
                        <h6 className="mb-0 text-success fw-semibold">
                          <i className="bi bi-star-fill me-2"></i>
                          Fantasy Statistics
                        </h6>
                        <small className="text-muted">
                          Fantasy football scoring data
                        </small>
                      </div>
                      <div className="card-body p-0">
                        {fantasyStats ? (
                          fantasyStats.length > 0 ? (
                            <FantasyStatTable
                              fantasyStats={fantasyStats}
                            ></FantasyStatTable>
                          ) : (
                            <div className="text-center p-4 text-muted">
                              No fantasy data available
                            </div>
                          )
                        ) : (
                          <div className="text-center p-4">
                            <div
                              className="spinner-border text-success"
                              role="status"
                            >
                              <span className="visually-hidden">
                                Loading...
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <p>Loading...</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
