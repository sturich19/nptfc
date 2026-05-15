import { useEffect, useState } from "react";
import { Player } from "../../objects/player";
import { PositionString } from "../../utils/game-stats-util";
import { Season } from "../../objects/season";
import { GetPlayerGameStats } from "../../services/game-stat-service";
import { GameStat } from "../../objects/game-stat";

interface playerProps {
  player: Player;
  seasons?: Season[];
}

const PlayerCard = (playerProps: playerProps) => {
  const [playerStats, setPlayerStats] = useState<GameStat[]>([]);

  var position = PositionString(playerProps.player.position);

  useEffect(() => {
    if (playerProps.player.id && playerProps.seasons) {
      // Get stats for this player across the filtered seasons
      const seasonIds = playerProps.seasons.map((s) => s.id);
      GetPlayerGameStats(playerProps.player.id).then((stats) => {
        const filteredStats =
          stats?.filter((stat: GameStat) =>
            seasonIds.includes(stat.seasonId),
          ) || [];
        setPlayerStats(filteredStats);
      });
    }
  }, [playerProps.player.id, playerProps.seasons]);

  // Group stats by season for display
  const getSeasonStats = () => {
    const seasonStatsMap = new Map();

    // Initialize with seasons (even if no stats)
    playerProps.seasons?.forEach((season) => {
      seasonStatsMap.set(season.id, {
        season: season,
        apps: 0,
        goals: 0,
        assists: 0,
      });
    });

    // Add actual stats
    playerStats.forEach((stat) => {
      const existing = seasonStatsMap.get(stat.seasonId);
      if (existing) {
        existing.apps += stat.apps || 0;
        existing.goals += stat.goals || 0;
        existing.assists += stat.assists || 0;
      }
    });

    // Sort by sequence (newest first)
    return Array.from(seasonStatsMap.values()).sort((a, b) => {
      return (b.season.sequence ?? 0) - (a.season.sequence ?? 0);
    });

  };

  // Calculate totals across all displayed seasons
  const calculateTotals = () => {
    const seasonStats = getSeasonStats();
    return seasonStats.reduce(
      (totals, stats) => ({
        apps: totals.apps + stats.apps,
        goals: totals.goals + stats.goals,
        assists: totals.assists + stats.assists,
      }),
      { apps: 0, goals: 0, assists: 0 },
    );
  };

  const getPositionColor = () => {
    switch (playerProps.player.position) {
      case 1:
        return "warning"; // GK
      case 2:
      case 3:
      case 4:
      case 5:
        return "primary"; // Defenders
      case 6:
      case 7:
      case 8:
        return "info"; // Midfielders
      case 9:
      case 10:
      case 11:
        return "danger"; // Forwards
      default:
        return "secondary";
    }
  };

  const seasonStats = getSeasonStats();

  return (
    <div className="col-xl-4 col-lg-6 col-md-6 col-sm-12">
      <div className="card shadow-sm mb-2">
        <div className="card-body p-3">
          {/* Player Header */}
          <div className="d-flex justify-content-between align-items-center mb-2">
            <div className="flex-grow-1">
              <h6
                className="mb-0 text-success fw-bold"
                style={{ fontSize: "0.95rem" }}
              >
                {playerProps.player.firstname} {playerProps.player.surname}
              </h6>
            </div>
            <div className="d-flex gap-1 align-items-center">
              <span
                className={`badge bg-${getPositionColor()} text-white`}
                style={{ fontSize: "0.7rem" }}
              >
                {position}
              </span>
              <span
                className="badge bg-dark text-white"
                style={{ fontSize: "0.7rem" }}
              >
                #{playerProps.player.shirt}
              </span>
            </div>
          </div>

          {/* Season-by-Season Stats */}
          <div>
            {/* Header */}
            <div className="row g-1 mb-1 pb-1 border-bottom border-light">
              <div className="col-4">
                <small
                  className="text-muted fw-bold"
                  style={{ fontSize: "0.7rem" }}
                >
                  Season
                </small>
              </div>
              <div className="col-3 text-center">
                <small
                  className="text-muted fw-bold"
                  style={{ fontSize: "0.7rem" }}
                >
                  Apps
                </small>
              </div>
              <div className="col-3 text-center">
                <small
                  className="text-muted fw-bold"
                  style={{ fontSize: "0.7rem" }}
                >
                  Gls
                </small>
              </div>
              <div className="col-2 text-center">
                <small
                  className="text-muted fw-bold"
                  style={{ fontSize: "0.7rem" }}
                >
                  Ast
                </small>
              </div>
            </div>

            {/* Stats Rows */}
            {seasonStats.map((stats, index) => (
              <div
                key={stats.season.id}
                className="row g-1 mb-1 align-items-center"
              >
                <div className="col-4">
                  <small className="text-dark" style={{ fontSize: "0.75rem" }}>
                    U{stats.season.ageGroup} Div {stats.season.division}
                  </small>
                </div>
                <div className="col-3 text-center">
                  <span
                    className="badge bg-light text-dark"
                    style={{ fontSize: "0.7rem" }}
                  >
                    {stats.apps}
                  </span>
                </div>
                <div className="col-3 text-center">
                  <span
                    className="badge bg-light text-dark"
                    style={{ fontSize: "0.7rem" }}
                  >
                    {stats.goals}
                  </span>
                </div>
                <div className="col-2 text-center">
                  <span
                    className="badge bg-light text-dark"
                    style={{ fontSize: "0.7rem" }}
                  >
                    {stats.assists}
                  </span>
                </div>
              </div>
            ))}

            {/* Totals Row */}
            {seasonStats.length > 0 &&
              (() => {
                const totals = calculateTotals();
                return (
                  <div className="row g-1 mt-2 pt-2 border-top border-success align-items-center">
                    <div className="col-4">
                      <small
                        className="text-success fw-bold"
                        style={{ fontSize: "0.75rem" }}
                      >
                        Total
                      </small>
                    </div>
                    <div className="col-3 text-center">
                      <span
                        className="badge bg-success text-white"
                        style={{ fontSize: "0.7rem" }}
                      >
                        {totals.apps}
                      </span>
                    </div>
                    <div className="col-3 text-center">
                      <span
                        className="badge bg-success text-white"
                        style={{ fontSize: "0.7rem" }}
                      >
                        {totals.goals}
                      </span>
                    </div>
                    <div className="col-2 text-center">
                      <span
                        className="badge bg-success text-white"
                        style={{ fontSize: "0.7rem" }}
                      >
                        {totals.assists}
                      </span>
                    </div>
                  </div>
                );
              })()}

            {/* Show message if no stats */}
            {seasonStats.length === 0 && (
              <div className="text-center py-2">
                <small className="text-muted">No stats available</small>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default PlayerCard;
