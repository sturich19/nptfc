import { useParams } from 'react-router-dom';
import { Box, CircularProgress, Typography, Alert } from '@mui/material';
import { useLiveTracker } from './hooks/use-live-tracker';
import SquadSetup from './components/squad-setup';
import TrackerBoard from './components/tracker-board';
import SaveOutcome from './components/save-outcome';

const LiveTracker = () => {
  const { fixtureId } = useParams<{ fixtureId: string }>();
  const tracker = useLiveTracker(Number(fixtureId));

  if (tracker.isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (tracker.error && tracker.phase === 'setup') {
    return (
      <Box p={2}>
        <Alert severity="error">{tracker.error}</Alert>
      </Box>
    );
  }

  if (tracker.phase === 'done') {
    return <SaveOutcome fixture={tracker.fixture} />;
  }

  if (tracker.phase === 'saving') {
    return (
      <Box position="relative">
        <TrackerBoard tracker={tracker} />
        <Box
          position="fixed"
          top={0} left={0} right={0} bottom={0}
          bgcolor="rgba(0,0,0,0.4)"
          display="flex"
          alignItems="center"
          justifyContent="center"
          zIndex={200}
        >
          <Box textAlign="center">
            <CircularProgress sx={{ color: 'white' }} />
            <Typography sx={{ color: 'white', mt: 1 }}>Saving…</Typography>
          </Box>
        </Box>
      </Box>
    );
  }

  if (tracker.phase === 'tracking') {
    return <TrackerBoard tracker={tracker} />;
  }

  return <SquadSetup tracker={tracker} />;
};

export default LiveTracker;
