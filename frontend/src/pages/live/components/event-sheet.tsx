import { Box, Button, Drawer, Grid, Typography } from '@mui/material';
import { Player } from '../../../objects/player';
import { EventType, EVENT_LABELS } from '../types';

interface EventSheetProps {
  open: boolean;
  player: Player | null;
  onEvent: (type: EventType) => void;
  onClose: () => void;
}

const GREEN = '#28a745';

const eventBtn = {
  minHeight: 56,
  fontSize: '0.95rem',
  color: GREEN,
  borderColor: GREEN,
  '&:hover': { bgcolor: GREEN, color: 'white', borderColor: GREEN },
};

const GOAL_EVENTS: EventType[] = ['GOAL_LEFT', 'GOAL_RIGHT', 'GOAL_OTHER'];
const SHOT_EVENTS: EventType[] = ['SHOT_ON', 'SHOT_OFF', 'SHOT_LEFT', 'SHOT_RIGHT'];
const OTHER_EVENTS: EventType[] = ['ASSIST'];
const GK_EVENTS: EventType[] = ['SAVE', 'PEN_SAVE'];

interface GroupProps {
  label: string;
  events: EventType[];
  onEvent: (type: EventType) => void;
  onClose: () => void;
}

const EventGroup = ({ label, events, onEvent, onClose }: GroupProps) => (
  <Box mb={2}>
    <Typography variant="caption" fontWeight={700} color="text.secondary"
      sx={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>
      {label}
    </Typography>
    <Grid container spacing={1} mt={0.25}>
      {events.map(type => (
        <Grid item xs={6} key={type}>
          <Button variant="outlined" fullWidth sx={eventBtn}
            onClick={() => { onEvent(type); onClose(); }}>
            {EVENT_LABELS[type]}
          </Button>
        </Grid>
      ))}
    </Grid>
  </Box>
);

const EventSheet = ({ open, player, onEvent, onClose }: EventSheetProps) => {
  const isGK = player?.position === 0;

  return (
    <Drawer anchor="bottom" open={open} onClose={onClose} disableScrollLock>
      <Box p={2} pb={3}>
        <Typography variant="subtitle1" fontWeight={700} mb={2}>
          {player?.nickname}
        </Typography>

        <EventGroup label="Goals" events={GOAL_EVENTS} onEvent={onEvent} onClose={onClose} />
        <EventGroup label="Shots" events={SHOT_EVENTS} onEvent={onEvent} onClose={onClose} />
        <EventGroup label="Other" events={OTHER_EVENTS} onEvent={onEvent} onClose={onClose} />
        {isGK && (
          <EventGroup label="Goalkeeper" events={GK_EVENTS} onEvent={onEvent} onClose={onClose} />
        )}

        <Button variant="text" fullWidth sx={{ mt: 1, color: 'text.secondary' }} onClick={onClose}>
          Cancel
        </Button>
      </Box>
    </Drawer>
  );
};

export default EventSheet;
