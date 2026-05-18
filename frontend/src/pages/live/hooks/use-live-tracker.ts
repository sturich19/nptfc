import { useState, useEffect } from 'react';
import { TrackerPhase, LiveEvent, PlayerLiveStats, EventType, EVENT_FIELD_MAP } from '../types';
import { TigersFixture } from '../../../objects/tigers-fixture';
import { Player } from '../../../objects/player';
import { GameStat } from '../../../objects/game-stat';
import { GetTigersFixture } from '../../../services/tigers-fixture-service';
import { GetPlayers } from '../../../services/player-service';
import { GetFixtureGameStats, PostGameStatsBulk } from '../../../services/game-stat-service';

export interface UseLiveTrackerResult {
  phase: TrackerPhase;
  fixture: TigersFixture | null;
  players: Player[];
  squadIds: Set<number>;
  stats: Map<number, PlayerLiveStats>;
  eventLog: LiveEvent[];
  isLoading: boolean;
  error: string | null;
  toggleSquadMember: (playerId: number) => void;
  startTracking: () => void;
  addEvent: (playerId: number, type: EventType) => void;
  undoLastEvent: () => void;
  saveMatch: () => Promise<void>;
  backToSetup: () => void;
}

function emptyStats(playerId: number): PlayerLiveStats {
  return {
    playerId,
    goals: 0, goalsLeft: 0, goalsRight: 0, goalsOther: 0,
    assists: 0, shots: 0, shotsOnTarget: 0, shotsOffTarget: 0,
    shotsLeft: 0, shotsRight: 0,
    saves: 0, penSaves: 0,
    played: true,
  };
}

export function useLiveTracker(fixtureId: number): UseLiveTrackerResult {
  const [phase, setPhase] = useState<TrackerPhase>('setup');
  const [fixture, setFixture] = useState<TigersFixture | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [squadIds, setSquadIds] = useState<Set<number>>(new Set());
  const [stats, setStats] = useState<Map<number, PlayerLiveStats>>(new Map());
  const [eventLog, setEventLog] = useState<LiveEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!fixtureId) return;
    setIsLoading(true);
    setError(null);

    Promise.all([
      GetTigersFixture(fixtureId),
      GetPlayers(),
      GetFixtureGameStats(fixtureId),
    ])
      .then(([fixtureData, playersData, existingStats]) => {
        setFixture(fixtureData ?? null);
        setPlayers((playersData ?? []) as Player[]);

        const preSquad = new Set<number>();
        const preStats = new Map<number, PlayerLiveStats>();
        ((existingStats ?? []) as GameStat[]).forEach((gs) => {
          if (gs.played) {
            preSquad.add(gs.playerId);
            preStats.set(gs.playerId, {
              playerId: gs.playerId,
              goals: gs.goals ?? 0,
              goalsLeft: gs.goalsLeft ?? 0,
              goalsRight: gs.goalsRight ?? 0,
              goalsOther: gs.goalsOther ?? 0,
              assists: gs.assists ?? 0,
              shots: gs.shots ?? 0,
              shotsOnTarget: gs.shotsOnTarget ?? 0,
              shotsOffTarget: gs.shotsOffTarget ?? 0,
              shotsLeft: gs.shotsLeft ?? 0,
              shotsRight: gs.shotsRight ?? 0,
              saves: gs.saves ?? 0,
              penSaves: gs.penSaves ?? 0,
              played: true,
            });
          }
        });
        setSquadIds(preSquad);
        setStats(preStats);
      })
      .catch(() => setError('Failed to load fixture data'))
      .finally(() => setIsLoading(false));
  }, [fixtureId]);

  const toggleSquadMember = (playerId: number) => {
    setSquadIds(prev => {
      const next = new Set(prev);
      if (next.has(playerId)) {
        next.delete(playerId);
      } else {
        next.add(playerId);
      }
      return next;
    });
  };

  const startTracking = () => {
    setStats(prev => {
      const next = new Map(prev);
      squadIds.forEach(playerId => {
        if (!next.has(playerId)) {
          next.set(playerId, emptyStats(playerId));
        }
      });
      return next;
    });
    setPhase('tracking');
  };

  const addEvent = (playerId: number, type: EventType) => {
    const player = players.find(p => p.id === playerId);
    const event: LiveEvent = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`,
      playerId,
      playerName: player?.nickname ?? `#${playerId}`,
      eventType: type,
      timestamp: Date.now(),
    };
    setEventLog(prev => [...prev, event]);

    const deltas = EVENT_FIELD_MAP[type];
    setStats(prev => {
      const next = new Map(prev);
      const current = next.get(playerId) ?? emptyStats(playerId);
      const updated = { ...current };
      (Object.keys(deltas) as (keyof PlayerLiveStats)[]).forEach(key => {
        if (typeof updated[key] === 'number') {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (updated as any)[key] = (updated[key] as number) + ((deltas[key] as number) ?? 0);
        }
      });
      next.set(playerId, updated);
      return next;
    });
  };

  const undoLastEvent = () => {
    setEventLog(prev => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      const deltas = EVENT_FIELD_MAP[last.eventType];
      setStats(statsMap => {
        const next = new Map(statsMap);
        const current = next.get(last.playerId);
        if (!current) return next;
        const updated = { ...current };
        (Object.keys(deltas) as (keyof PlayerLiveStats)[]).forEach(key => {
          if (typeof updated[key] === 'number') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (updated as any)[key] = Math.max(0, (updated[key] as number) - ((deltas[key] as number) ?? 0));
          }
        });
        next.set(last.playerId, updated);
        return next;
      });
      return prev.slice(0, -1);
    });
  };

  const saveMatch = async () => {
    if (!fixture) {
      setError('No fixture loaded');
      return;
    }
    if (!fixture.seasonId) {
      setError('Fixture is missing season data — cannot save');
      return;
    }
    setPhase('saving');
    setError(null);

    const payload: GameStat[] = Array.from(squadIds).map(playerId => {
      const s = stats.get(playerId) ?? emptyStats(playerId);
      return {
        id: 0,
        apps: 1,
        playerId,
        fixtureId: fixture.id,
        seasonId: fixture.seasonId,
        played: true,
        goals: s.goals,
        goalsLeft: s.goalsLeft,
        goalsRight: s.goalsRight,
        goalsOther: s.goalsOther,
        assists: s.assists,
        shots: s.shots,
        shotsOnTarget: s.shotsOnTarget,
        shotsOffTarget: s.shotsOffTarget,
        shotsLeft: s.shotsLeft,
        shotsRight: s.shotsRight,
        saves: s.saves,
        penSaves: s.penSaves,
        cleanSheets: 0,
        gso: 0,
        playerName: '',
      } as GameStat;
    });

    try {
      await PostGameStatsBulk(payload);
      setPhase('done');
    } catch {
      setError('Failed to save match. Tap Retry to try again.');
      setPhase('tracking');
    }
  };

  const backToSetup = () => setPhase('setup');

  return {
    phase, fixture, players, squadIds, stats, eventLog,
    isLoading, error,
    toggleSquadMember, startTracking, addEvent, undoLastEvent, saveMatch, backToSetup,
  };
}
