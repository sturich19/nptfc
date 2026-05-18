import { useState } from 'react';
import {
  Alert, Box, Button,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  Typography,
} from '@mui/material';
import { format } from 'date-fns';
import { UseLiveTrackerResult } from '../hooks/use-live-tracker';
import PlayerCard from './player-card';
import EventSheet from './event-sheet';
import EventLog from './event-log';
import '../live-tracker.css';

interface TrackerBoardProps {
  tracker: UseLiveTrackerResult;
}

const TrackerBoard = ({ tracker }: TrackerBoardProps) => {
  const [activePlayerId, setActivePlayerId] = useState<number | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const squadPlayers = tracker.players
    .filter(p => tracker.squadIds.has(p.id))
    .sort((a, b) => (a.shirt ?? 99) - (b.shirt ?? 99));

  const activePlayer = activePlayerId !== null
    ? tracker.players.find(p => p.id === activePlayerId) ?? null
    : null;

  return (
    <div className="lt-page">
      {tracker.fixture && (
        <Box mb={1}>
          <Typography variant="subtitle1" fontWeight={600}>
            {tracker.fixture.homeTeam} vs {tracker.fixture.awayTeam}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {format(new Date(tracker.fixture.date), 'EEE d MMM')}
          </Typography>
        </Box>
      )}

      <Button size="small" onClick={tracker.backToSetup} sx={{ mb: 1 }}>
        ← Edit Squad
      </Button>

      {tracker.error && (
        <Alert severity="error" sx={{ mb: 1 }}
          action={
            <Button color="inherit" size="small" onClick={tracker.saveMatch}>Retry</Button>
          }>
          {tracker.error}
        </Alert>
      )}

      <EventLog events={tracker.eventLog} onUndo={tracker.undoLastEvent} />

      <div className="lt-player-grid">
        {squadPlayers.map(player => (
          <PlayerCard
            key={player.id}
            player={player}
            stats={tracker.stats.get(player.id)}
            onClick={() => setActivePlayerId(player.id)}
          />
        ))}
      </div>

      <EventSheet
        open={activePlayerId !== null}
        player={activePlayer}
        onEvent={(type) => {
          if (activePlayerId !== null) tracker.addEvent(activePlayerId, type);
        }}
        onClose={() => setActivePlayerId(null)}
      />

      <div className="lt-end-match-bar">
        <Button
          variant="contained"
          color="error"
          fullWidth
          onClick={() => setConfirmOpen(true)}
          disabled={tracker.phase === 'saving'}
        >
          End Match
        </Button>
      </div>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>End Match?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Save stats for {tracker.squadIds.size} player{tracker.squadIds.size !== 1 ? 's' : ''}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            disabled={tracker.phase === 'saving'}
            onClick={() => { setConfirmOpen(false); tracker.saveMatch(); }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default TrackerBoard;
