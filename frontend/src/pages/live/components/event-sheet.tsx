import { Box, Button, Drawer, Grid, Typography } from '@mui/material';
import { Player } from '../../../objects/player';
import { EventType, EVENT_LABELS, GK_ONLY_EVENTS } from '../types';

interface EventSheetProps {
  open: boolean;
  player: Player | null;
  onEvent: (type: EventType) => void;
  onClose: () => void;
}

const ALL_EVENTS: EventType[] = [
  'GOAL_LEFT', 'GOAL_RIGHT', 'GOAL_OTHER',
  'SHOT_ON', 'SHOT_OFF',
  'ASSIST', 'SAVE', 'PEN_SAVE',
];

const EventSheet = ({ open, player, onEvent, onClose }: EventSheetProps) => {
  const isGK = player?.position === 0;
  const visibleEvents = ALL_EVENTS.filter(e => isGK || !GK_ONLY_EVENTS.includes(e));

  return (
    <Drawer anchor="bottom" open={open} onClose={onClose} disableScrollLock>
      <Box p={2}>
        <Typography variant="subtitle1" fontWeight={600} mb={1.5}>
          {player?.nickname} — select event
        </Typography>
        <Grid container spacing={1}>
          {visibleEvents.map(type => (
            <Grid item xs={6} key={type}>
              <Button
                variant="outlined"
                fullWidth
                className="lt-event-btn"
                onClick={() => { onEvent(type); onClose(); }}
              >
                {EVENT_LABELS[type]}
              </Button>
            </Grid>
          ))}
        </Grid>
        <Button variant="text" fullWidth sx={{ mt: 1 }} onClick={onClose}>
          Cancel
        </Button>
      </Box>
    </Drawer>
  );
};

export default EventSheet;
