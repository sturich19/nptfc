import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { GetHistoryFixture } from "../services/fixture-service";
import { Fixture } from "../objects/fixture";
import FixtureTable from "../components/fixtures/fixture-table";

const LeagueFixtureHistory = () => {
  const { id, id2 } = useParams();
  const [fixtures, setFixtures] = useState<Fixture[] | null>(null);

  useEffect(() => {
    GetHistoryFixture(id2).then((fixtures) => setFixtures(fixtures));
  }, []);

  const navigate = useNavigate();

  function handleResultClick(fixtureId: number) {
    navigate(`/AdminLeagueFixtureUpdate/${id}/${id2}`);
  }

  return (
    <div className="container-fluid">
      {/* Modern Compact Header */}
      <div className="d-flex justify-content-between align-items-center mb-3 p-3 bg-light rounded">
        <div>
          <h5 className="mb-0 text-success fw-bold">
            <i className="bi bi-clock-history me-2"></i>
            Fixture History
          </h5>
          <small className="text-muted">Head-to-head match history</small>
        </div>
        <button
          className="btn btn-success"
          onClick={() => navigate("/season/" + id)}
        >
          <i className="bi bi-arrow-left me-1"></i>
          Back to Season
        </button>
      </div>

      {/* Fixtures History Table */}
      <div className="card shadow-sm">
        <div className="card-header bg-light border-bottom">
          <h6 className="mb-0 text-success fw-semibold">
            <i className="bi bi-list-ul me-2"></i>
            Match Results
          </h6>
          <small className="text-muted">
            Click on a fixture to update the score
          </small>
        </div>
        <div className="card-body p-0">
          {fixtures ? (
            fixtures.length > 0 ? (
              <FixtureTable
                fixtures={fixtures}
                handleClick={handleResultClick}
              />
            ) : (
              <div className="text-center p-4 text-muted">
                No fixture history available
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
};

export default LeagueFixtureHistory;
