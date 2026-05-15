import { useEffect, useState } from "react";
import { GetPlayers } from "../services/player-service";
import { Player } from "../objects/player";
import PlayerCard from "../atoms/card/player-card";
import { GetSeasons } from "../services/season-service";
import { Season } from "../objects/season";

export default function Players() {
  const [players, setPlayers] = useState<Player[] | null>(null);
  const [seasons, setSeasons] = useState<Season[] | undefined>();
  const [showAllSeasons, setShowAllSeasons] = useState(false);

  useEffect(() => {
    GetPlayers().then((player) => setPlayers(player));
    GetSeasons().then((seasons) => {
      // Sort seasons by sequence (most recent first)
      const sortedSeasons = seasons?.sort((a: Season, b: Season) => {
        return (b.sequence ?? 0) - (a.sequence ?? 0);
      });

      setSeasons(sortedSeasons);
    });
  }, []);

  const getFilteredSeasons = () => {
    if (!seasons || showAllSeasons) return seasons;
    // Show only the 2 most recent seasons by default
    return seasons.slice(0, 2);
  };

  return (
    <div className="container-fluid">
      {/* Modern Compact Header */}
      <div className="d-flex justify-content-between align-items-center mb-3 p-3 bg-light rounded">
        <div>
          <h5 className="mb-0 text-success fw-bold">
            <i className="bi bi-people-fill me-2"></i>
            Player Statistics
          </h5>
          <small className="text-muted">
            {showAllSeasons ? "All seasons" : "Recent seasons (last 2)"} •{" "}
            {players?.length || 0} players
          </small>
        </div>
        <div className="d-flex gap-2">
          <button
            className={`btn btn-sm ${!showAllSeasons ? "btn-success" : "btn-outline-success"}`}
            onClick={() => setShowAllSeasons(false)}
          >
            Recent
          </button>
          <button
            className={`btn btn-sm ${showAllSeasons ? "btn-success" : "btn-outline-success"}`}
            onClick={() => setShowAllSeasons(true)}
          >
            All Seasons
          </button>
        </div>
      </div>

      {players ? (
        <div className="row g-2">
          {players.map((item) => (
            <PlayerCard
              key={item.id}
              player={item}
              seasons={getFilteredSeasons()}
            ></PlayerCard>
          ))}
        </div>
      ) : (
        <div className="text-center p-4">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}
    </div>
  );
}
