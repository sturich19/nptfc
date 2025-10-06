import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { GetTigersFixture } from "../services/tigers-fixture-service";
import { TigersFixture } from "../objects/tigers-fixture";
import { FantasyStat } from "../objects/fantasy-stat";
import { GetFixtureFantasyStats } from "../services/fantasy-stat-service";
import FantasyStatTable from "../components/fantasy/fantasy-stat-table";
import { FormatDate } from "../utils/formatter-util";

export default function TigersFixturePage()
{
    const navigate = useNavigate();
    const param = useParams();
    const [fixture, setFixture] = useState<TigersFixture | null>(null);
    const [fantasyStats, setFantasyStats] = useState<FantasyStat[] | null>(null);

    useEffect(() => {
        GetTigersFixture(param.id).then(fixture => setFixture(fixture));
        GetFixtureFantasyStats(param.id).then(fantasyStats => setFantasyStats(fantasyStats));
    }, [param.id]);

    return(
        <div className="container-fluid">
            {/* Modern Compact Header - Responsive */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center align-items-md-center mb-3 p-3 bg-light rounded">
                <div className="text-center text-md-start mb-3 mb-md-0">
                    {fixture ? (
                        <>
                            <h5 className="mb-0 text-success fw-bold">
                                <i className="bi bi-trophy me-2"></i>
                                {fixture.homeTeam} {fixture.homeTeamScore} - {fixture.awayTeamScore} {fixture.awayTeam}
                            </h5>
                            <small className="text-muted">
                                <i className="bi bi-calendar3 me-1"></i>
                                {FormatDate(fixture.date)}
                                {fixture.videoUrl && (
                                    <span className="ms-3">
                                        <i className="bi bi-camera-video me-1"></i>
                                        <a href={fixture.videoUrl} target="_blank" rel="noreferrer" className="text-primary">
                                            Match Video Available
                                        </a>
                                    </span>
                                )}
                            </small>
                        </>
                    ) : (
                        <>
                            <h5 className="mb-0 text-success fw-bold">
                                <i className="bi bi-trophy me-2"></i>
                                Loading Fixture...
                            </h5>
                            <small className="text-muted">Please wait while we load the match details</small>
                        </>
                    )}
                </div>
                <button
                    className="btn btn-secondary"
                    onClick={() => navigate('/season/' + fixture?.seasonId)}
                >
                    <i className="bi bi-arrow-left me-1"></i>
                    Back to Season
                </button>
            </div>
            
            {/* Fantasy Statistics */}
            <div className="card shadow-sm mb-4">
                <div className="card-header bg-light border-bottom">
                    <h6 className="mb-0 text-success fw-semibold">
                        <i className="bi bi-star me-2"></i>
                        Fantasy Statistics
                    </h6>
                    <small className="text-muted">
                        Player performance statistics for this match
                    </small>
                </div>
                <div className="card-body p-0">
                    {fantasyStats ? (
                        <FantasyStatTable fantasyStats={fantasyStats} />
                    ) : (
                        <div className="text-center py-4 text-muted">
                            <div className="spinner-border text-success" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <p className="mt-2">Loading match statistics...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}