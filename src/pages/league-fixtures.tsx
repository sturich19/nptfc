import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { GetResultsForTeam } from "../services/fixture-service";
import FixtureTable from "../components/fixtures/fixture-table";
import { TeamsFixtures } from "../objects/team-fixtures";
import HeaderAtom from "../atoms/header/header-atom";

export default function LeagueFixturesPage() {
  const navigate = useNavigate();
  const { id, id2 } = useParams();
  const [teamResults, setTeamResults] = useState<TeamsFixtures | null>(null);

  useEffect(() => {
    GetResultsForTeam(id, id2).then((teamResults) =>
      setTeamResults(teamResults),
    );
  }, [id, id2]);

  function handleResultClick(fixtureId: number) {
    navigate(`/LeagueFixtureHistory/${id}/${fixtureId}`);
  }

  return (
    <div className="container-fluid">
      {/* Modern Compact Header */}
      <div className="d-flex justify-content-between align-items-center mb-3 p-3 bg-light rounded">
        <div>
          <h5 className="mb-0 text-success fw-bold">
            <i className="bi bi-calendar-event me-2"></i>
            {teamResults?.teamName || "Loading..."}
          </h5>
          <small className="text-muted">Team fixtures and results</small>
        </div>
        <button
          className="btn btn-success"
          onClick={() => navigate("/season/" + id)}
        >
          <i className="bi bi-arrow-left me-1"></i>
          Back to Season
        </button>
      </div>

      {/* Fixtures Table */}
      <div className="card shadow-sm">
        <div className="card-header bg-light border-bottom">
          <h6 className="mb-0 text-success fw-semibold">
            <i className="bi bi-list-ul me-2"></i>
            All Fixtures
          </h6>
          <small className="text-muted">
            Click on a fixture to view match history
          </small>
        </div>
        <div className="card-body p-0">
          {teamResults ? (
            teamResults.fixtures.length > 0 ? (
              <FixtureTable
                fixtures={teamResults.fixtures}
                handleClick={handleResultClick}
              />
            ) : (
              <div className="text-center p-4 text-muted">
                No fixtures found for this team
              </div>
            )
          ) : (
            <div className="text-center p-4">
              <div className="spinner-border text-success" role="status">
                <span className="visually-hidden">Loading fixtures...</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
