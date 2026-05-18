import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { TigersFixture } from '../../../objects/tigers-fixture';

interface SaveOutcomeProps {
  fixture: TigersFixture | null;
}

const SaveOutcome = ({ fixture }: SaveOutcomeProps) => {
  const navigate = useNavigate();
  return (
    <Box display="flex" flexDirection="column" alignItems="center"
         justifyContent="center" minHeight="60vh" gap={2} p={3}>
      <CheckCircleIcon sx={{ fontSize: 72, color: 'success.main' }} />
      <Typography variant="h5" fontWeight="bold">Match saved!</Typography>
      {fixture && (
        <Typography variant="body1" color="text.secondary" textAlign="center">
          {fixture.homeTeam} vs {fixture.awayTeam}
        </Typography>
      )}
      <Button variant="contained" fullWidth sx={{ mt: 2 }} onClick={() => navigate('/live')}>
        Back to Fixtures
      </Button>
    </Box>
  );
};

export default SaveOutcome;
