import { Avatar, Box, Card, CardActionArea, CardContent, Chip, Typography } from '@mui/material';
import { Player } from '../../../objects/player';
import { PlayerLiveStats } from '../types';

interface PlayerCardProps {
  player: Player;
  stats: PlayerLiveStats | undefined;
  onClick: () => void;
}

const PlayerCard = ({ player, stats, onClick }: PlayerCardProps) => {
  const isGK = player.position === 0;

  return (
    <Card elevation={2} className="lt-player-card">
      <CardActionArea sx={{ height: '100%' }} onClick={onClick}>
        <CardContent sx={{ p: 1.5 }}>
          <Box display="flex" alignItems="center" gap={1} mb={0.5}>
            <Avatar sx={{ bgcolor: '#00897b', width: 28, height: 28, fontSize: '0.75rem' }}>
              {player.shirt}
            </Avatar>
            <Typography variant="body1" fontWeight="bold" noWrap flex={1}>
              {player.nickname}
            </Typography>
            {isGK && <Chip label="GK" size="small" color="primary" variant="outlined" />}
          </Box>
          <Box display="flex" flexWrap="wrap" gap={0.5} mt={0.5}>
            {(stats?.goals ?? 0) > 0 && (
              <Chip label={`${stats!.goals}G`} size="small" color="success" />
            )}
            {(stats?.assists ?? 0) > 0 && (
              <Chip label={`${stats!.assists}A`} size="small" color="info" />
            )}
            {(stats?.shotsOnTarget ?? 0) > 0 && (
              <Chip label={`${stats!.shotsOnTarget}SOT`} size="small" />
            )}
            {isGK && (stats?.saves ?? 0) > 0 && (
              <Chip label={`${stats!.saves}Sv`} size="small" color="warning" />
            )}
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default PlayerCard;
