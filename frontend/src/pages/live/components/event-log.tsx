import { Box, Button, List, ListItem, ListItemText, Typography } from '@mui/material';
import { formatDistanceToNow } from 'date-fns';
import { LiveEvent, EVENT_LABELS } from '../types';

interface EventLogProps {
  events: LiveEvent[];
  onUndo: () => void;
}

const EventLog = ({ events, onUndo }: EventLogProps) => {
  if (events.length === 0) {
    return (
      <Box className="lt-event-log" display="flex" alignItems="center" justifyContent="center"
           sx={{ minHeight: 48 }}>
        <Typography variant="body2" color="text.disabled">No events yet</Typography>
      </Box>
    );
  }

  const reversed = [...events].reverse();

  return (
    <div className="lt-event-log">
      <List dense disablePadding>
        {reversed.map((event, idx) => (
          <ListItem
            key={event.id}
            disablePadding
            secondaryAction={
              idx === 0 ? (
                <Button size="small" color="warning" onClick={onUndo}>Undo</Button>
              ) : undefined
            }
          >
            <ListItemText
              primary={`${event.playerName} — ${EVENT_LABELS[event.eventType]}`}
              secondary={formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
              sx={{ pr: idx === 0 ? 8 : 0 }}
            />
          </ListItem>
        ))}
      </List>
    </div>
  );
};

export default EventLog;
