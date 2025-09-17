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
      // Sort seasons by most recent first
      const sortedSeasons = seasons?.sort((a: Season, b: Season) => {
        // First compare end years
        if (b.endYear !== a.endYear) {
          return b.endYear - a.endYear;
        }

        // If end years are the same, compare by end month
        const monthOrder: { [key: string]: number } = {
          January: 1,
          February: 2,
          March: 3,
          April: 4,
          May: 5,
          June: 6,
          July: 7,
          August: 8,
          September: 9,
          October: 10,
          November: 11,
          December: 12,
        };

        const aEndMonth = monthOrder[a.monthEnd] || 0;
        const bEndMonth = monthOrder[b.monthEnd] || 0;

        if (bEndMonth !== aEndMonth) {
          return bEndMonth - aEndMonth;
        }

        // If end months are the same, compare start years
        if (b.startYear !== a.startYear) {
          return b.startYear - a.startYear;
        }

        // Finally, compare start months
        const aStartMonth = monthOrder[a.monthStart] || 0;
        const bStartMonth = monthOrder[b.monthStart] || 0;
        return bStartMonth - aStartMonth;
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
