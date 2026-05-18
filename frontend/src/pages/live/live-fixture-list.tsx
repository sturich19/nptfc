import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardActionArea, CardContent, CircularProgress,
  Alert, Button, Typography, Container,
} from '@mui/material';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import { GetTigersFixtures } from '../../services/tigers-fixture-service';
import { TigersFixture } from '../../objects/tigers-fixture';
import { format } from 'date-fns';

const GAME_TYPE_LABELS: Record<number, string> = {
  0: 'League',
  1: 'Cup',
  2: 'Friendly',
};

export function filterUpcomingFixtures(
  fixtures: TigersFixture[],
  today: Date = new Date(),
): TigersFixture[] {
  const todayStart = new Date(today);
  todayStart.setHours(0, 0, 0, 0);
  const windowEnd = new Date(todayStart);
  windowEnd.setDate(windowEnd.getDate() + 28);

  const upcoming = fixtures
    .filter(f => {
      const d = new Date(f.date);
      return d >= todayStart && d <= windowEnd;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (upcoming.length > 0) return upcoming;

  return fixtures
    .filter(f => new Date(f.date) < todayStart)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);
}

const LiveFixtureList = () => {
  const [fixtures, setFixtures] = useState<TigersFixture[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const loadFixtures = () => {
    setIsLoading(true);
    setError(null);
    GetTigersFixtures()
      .then(data => setFixtures(filterUpcomingFixtures((data ?? []) as TigersFixture[])))
      .catch(() => setError('Failed to load fixtures'))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => { loadFixtures(); }, []);

  return (
    <Container maxWidth="sm" sx={{ py: 2 }}>
      <Box display="flex" alignItems="center" gap={1} mb={2}>
        <SportsSoccerIcon color="success" />
        <Typography variant="h5" fontWeight="bold">Live Tracker</Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" mb={2}>
        Tap a fixture to start tracking stats in real time.
      </Typography>

      {isLoading && (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}
          action={<Button color="inherit" size="small" onClick={loadFixtures}>Retry</Button>}>
          {error}
        </Alert>
      )}

      {!isLoading && !error && fixtures.length === 0 && (
        <Typography color="text.secondary" textAlign="center" py={4}>
          No upcoming fixtures found.
        </Typography>
      )}

      {!isLoading && !error && fixtures.map(f => (
        <Card key={f.id} elevation={2} sx={{ mb: 1.5 }}>
          <CardActionArea sx={{ p: 0 }} onClick={() => navigate(`/live/${f.id}`)}>
            <CardContent>
              <Typography variant="caption" color="text.secondary">
                {format(new Date(f.date), 'EEE d MMM')} &middot; {GAME_TYPE_LABELS[f.type] ?? 'Match'}
              </Typography>
              <Typography variant="h6" fontWeight="bold" mt={0.5}>
                {f.homeTeam ?? 'Home'} <Typography component="span" color="text.secondary">vs</Typography> {f.awayTeam ?? 'Away'}
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card>
      ))}
    </Container>
  );
};

export default LiveFixtureList;
