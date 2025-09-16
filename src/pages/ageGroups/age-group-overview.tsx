import { useEffect, useState } from 'react';
import { GetSeasonsForAgeGroup } from "../../services/season-service";
import { Season } from "../../objects/season";
import { useParams } from "react-router-dom";
import FantasyStats from '../fantasy-stats';
import { GameStat } from '../../objects/game-stat';
import GameStatTable from '../../components/game-stats/game-stat-table';
import { GetAgeGroupGameStats } from '../../services/game-stat-service';

const AgeGroupOverview = () => {
    
    const param = useParams();    
    const [seasons, setData] = useState<Season[] | null>(null);
    const [gameStats, setGameStats] = useState<GameStat[] | null>(null);
    
    useEffect(() => {
        GetSeasonsForAgeGroup(param.id).then(seasons => setData(seasons));
        GetAgeGroupGameStats(param.id).then(gameStats => setGameStats(gameStats));
    }, [param.id]);       

    return(
        <>
            <div className="container-fluid">
                {/* Modern Compact Header */}
                <div className="d-flex justify-content-between align-items-center mb-3 p-3 bg-light rounded">
                    <div>
                        <h5 className="mb-0 text-success fw-bold">
                            U{seasons != null ? seasons[0].ageGroup : ""} Overview
                        </h5>
                        <small className="text-muted">
                            Season statistics and fantasy scores
                        </small>
                    </div>
                </div>

                {/* Season Stats */}
                <div className="card shadow-sm mb-4">
                    <div className="card-header bg-light border-bottom">
                        <h6 className="mb-0 text-success fw-semibold">
                            <i className="bi bi-graph-up me-2"></i>
                            Season Stats
                        </h6>
                    </div>
                    <div className="card-body p-0">
                        {gameStats ? (
                            gameStats.length > 0 ? (
                                <GameStatTable gameStats={gameStats}></GameStatTable>
                            ) : (
                                <div className="text-center p-4 text-muted">No stats available</div>
                            )
                        ) : (
                            <div className="text-center p-4">
                                <div className="spinner-border text-success" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Fantasy Scores */}
                <div className="card shadow-sm mb-4">
                    <div className="card-header bg-light border-bottom">
                        <h6 className="mb-0 text-success fw-semibold">
                            <i className="bi bi-star-fill me-2"></i>
                            Fantasy Scores
                        </h6>
                    </div>
                    <div className="card-body p-0">
                        <FantasyStats ageGroup={param.id}></FantasyStats>
                    </div>
                </div>
            </div>

        </>
    )
}
export default AgeGroupOverview;