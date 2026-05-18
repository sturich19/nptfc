import { Box, Button, Checkbox, Container, List, ListItem, ListItemButton, ListItemText, Typography } from '@mui/material';
import { format } from 'date-fns';
import { UseLiveTrackerResult } from '../hooks/use-live-tracker';

const POSITION_LABELS: Record<number, string> = { 0: 'GK', 1: 'DEF', 2: 'MID', 3: 'ATT' };

interface SquadSetupProps {
  tracker: UseLiveTrackerResult;
}

const SquadSetup = ({ tracker }: SquadSetupProps) => {
  const { fixture, players, squadIds, toggleSquadMember, startTracking } = tracker;
  const sortedPlayers = [...players].sort((a, b) => (a.shirt ?? 99) - (b.shirt ?? 99));

  return (
    <Container maxWidth="sm" sx={{ py: 2 }}>
      {fixture && (
        <Box mb={2}>
          <Typography variant="h6" fontWeight="bold">
            {fixture.homeTeam} vs {fixture.awayTeam}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {format(new Date(fixture.date), 'EEE d MMM yyyy')}
          </Typography>
        </Box>
      )}
      <Typography variant="subtitle1" fontWeight={600} mb={1}>
        Select squad
      </Typography>
      <List dense disablePadding>
        {sortedPlayers.map(player => (
          <ListItem key={player.id} disablePadding>
            <ListItemButton onClick={() => toggleSquadMember(player.id)} sx={{ px: 1, minHeight: 48 }}>
              <Checkbox
                checked={squadIds.has(player.id)}
                disableRipple
                sx={{ p: 0.5, mr: 1 }}
                inputProps={{ 'aria-label': player.nickname }}
              />
              <ListItemText
                primary={
                  <Typography fontWeight={600}>
                    #{player.shirt} {player.nickname}
                  </Typography>
                }
                secondary={POSITION_LABELS[player.position] ?? 'Unknown'}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Button
        variant="contained"
        fullWidth
        disabled={squadIds.size === 0}
        onClick={startTracking}
        sx={{ mt: 2, minHeight: 56 }}
      >
        Start Tracking ({squadIds.size} players)
      </Button>
    </Container>
  );
};

export default SquadSetup;
