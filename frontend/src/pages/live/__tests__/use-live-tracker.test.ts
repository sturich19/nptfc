import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLiveTracker } from '../hooks/use-live-tracker';
import * as tigersFixtureService from '../../../services/tigers-fixture-service';
import * as playerService from '../../../services/player-service';
import * as gameStatService from '../../../services/game-stat-service';

vi.mock('../../../services/tigers-fixture-service');
vi.mock('../../../services/player-service');
vi.mock('../../../services/game-stat-service');

// polyfill crypto.randomUUID for happy-dom
if (!globalThis.crypto?.randomUUID) {
  Object.defineProperty(globalThis, 'crypto', {
    value: { randomUUID: () => Math.random().toString(36).slice(2) },
  });
}

const mockFixture = {
  id: 10,
  homeTeam: 'Tigers',
  awayTeam: 'Lions',
  homeTeamScore: 0,
  awayTeamScore: 0,
  date: new Date('2025-06-10'),
  result: 0,
  location: 0,
  seasonId: 5,
  type: 0,
  pts: 0,
  glsFor: 0,
  glsA: 0,
};

const mockPlayers = [
  { id: 1, nickname: 'Alice', shirt: 7, position: 1 },
  { id: 2, nickname: 'Bob', shirt: 1, position: 0 },
  { id: 3, nickname: 'Charlie', shirt: 10, position: 2 },
];

const emptyStats: any[] = [];

const setupMocks = (existingStats: any[] = emptyStats) => {
  (tigersFixtureService.GetTigersFixture as Mock).mockResolvedValue(mockFixture);
  (playerService.GetPlayers as Mock).mockResolvedValue(mockPlayers);
  (gameStatService.GetFixtureGameStats as Mock).mockResolvedValue(existingStats);
};

describe('useLiveTracker', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads fixture, players and initialises to setup phase', async () => {
    setupMocks();
    const { result } = renderHook(() => useLiveTracker(10));
    await act(async () => {});
    expect(result.current.phase).toBe('setup');
    expect(result.current.fixture?.id).toBe(10);
    expect(result.current.players).toHaveLength(3);
  });

  it('pre-populates squadIds from existing stats with played: true', async () => {
    setupMocks([
      { playerId: 2, played: true, goals: 1, goalsLeft: 1, goalsRight: 0, goalsOther: 0,
        assists: 0, shots: 1, shotsOnTarget: 1, shotsOffTarget: 0, saves: 0, penSaves: 0 },
    ]);
    const { result } = renderHook(() => useLiveTracker(10));
    await act(async () => {});
    expect(result.current.squadIds.has(2)).toBe(true);
    expect(result.current.squadIds.has(1)).toBe(false);
  });

  it('addEvent GOAL_LEFT increments goals and goalsLeft', async () => {
    setupMocks();
    const { result } = renderHook(() => useLiveTracker(10));
    await act(async () => {});
    act(() => result.current.toggleSquadMember(1));
    act(() => result.current.startTracking());
    act(() => result.current.addEvent(1, 'GOAL_LEFT'));
    const stats = result.current.stats.get(1);
    expect(stats?.goals).toBe(1);
    expect(stats?.goalsLeft).toBe(1);
    expect(stats?.goalsRight).toBe(0);
  });

  it('addEvent SHOT_ON increments shots and shotsOnTarget', async () => {
    setupMocks();
    const { result } = renderHook(() => useLiveTracker(10));
    await act(async () => {});
    act(() => result.current.toggleSquadMember(1));
    act(() => result.current.startTracking());
    act(() => result.current.addEvent(1, 'SHOT_ON'));
    const stats = result.current.stats.get(1);
    expect(stats?.shots).toBe(1);
    expect(stats?.shotsOnTarget).toBe(1);
    expect(stats?.shotsOffTarget).toBe(0);
  });

  it('addEvent ASSIST increments only assists', async () => {
    setupMocks();
    const { result } = renderHook(() => useLiveTracker(10));
    await act(async () => {});
    act(() => result.current.toggleSquadMember(1));
    act(() => result.current.startTracking());
    act(() => result.current.addEvent(1, 'ASSIST'));
    const stats = result.current.stats.get(1);
    expect(stats?.assists).toBe(1);
    expect(stats?.goals).toBe(0);
    expect(stats?.shots).toBe(0);
  });

  it('undoLastEvent reverts the most recent event', async () => {
    setupMocks();
    const { result } = renderHook(() => useLiveTracker(10));
    await act(async () => {});
    act(() => result.current.toggleSquadMember(1));
    act(() => result.current.startTracking());
    act(() => result.current.addEvent(1, 'GOAL_LEFT'));
    act(() => result.current.addEvent(1, 'ASSIST'));
    act(() => result.current.undoLastEvent());
    const stats = result.current.stats.get(1);
    expect(stats?.assists).toBe(0);
    expect(stats?.goals).toBe(1); // goal from first event remains
    expect(result.current.eventLog).toHaveLength(1);
  });

  it('undoLastEvent does nothing when event log is empty', async () => {
    setupMocks();
    const { result } = renderHook(() => useLiveTracker(10));
    await act(async () => {});
    act(() => result.current.undoLastEvent());
    expect(result.current.eventLog).toHaveLength(0);
  });

  it('startTracking sets phase to tracking', async () => {
    setupMocks();
    const { result } = renderHook(() => useLiveTracker(10));
    await act(async () => {});
    act(() => result.current.toggleSquadMember(1));
    act(() => result.current.startTracking());
    expect(result.current.phase).toBe('tracking');
  });

  it('saveMatch includes all squad members with played: true', async () => {
    const mockPost = vi.fn().mockResolvedValue(undefined);
    (gameStatService.PostGameStatsBulk as Mock).mockImplementation(mockPost);
    setupMocks();
    const { result } = renderHook(() => useLiveTracker(10));
    await act(async () => {});
    act(() => { result.current.toggleSquadMember(1); result.current.toggleSquadMember(3); });
    act(() => result.current.startTracking());
    act(() => result.current.addEvent(1, 'GOAL_LEFT'));
    await act(async () => result.current.saveMatch());
    const payload = mockPost.mock.calls[0][0];
    expect(payload).toHaveLength(2);
    expect(payload.every((p: any) => p.played === true)).toBe(true);
    const alice = payload.find((p: any) => p.playerId === 1);
    expect(alice?.goals).toBe(1);
    const charlie = payload.find((p: any) => p.playerId === 3);
    expect(charlie?.goals).toBe(0);
  });

  it('saveMatch uses fixture.seasonId in every payload entry', async () => {
    const mockPost = vi.fn().mockResolvedValue(undefined);
    (gameStatService.PostGameStatsBulk as Mock).mockImplementation(mockPost);
    setupMocks();
    const { result } = renderHook(() => useLiveTracker(10));
    await act(async () => {});
    act(() => result.current.toggleSquadMember(2));
    act(() => result.current.startTracking());
    await act(async () => result.current.saveMatch());
    const payload = mockPost.mock.calls[0][0];
    expect(payload.every((p: any) => p.seasonId === 5)).toBe(true);
  });

  it('saveMatch sets phase to done on success', async () => {
    (gameStatService.PostGameStatsBulk as Mock).mockResolvedValue(undefined);
    setupMocks();
    const { result } = renderHook(() => useLiveTracker(10));
    await act(async () => {});
    act(() => result.current.toggleSquadMember(1));
    act(() => result.current.startTracking());
    await act(async () => result.current.saveMatch());
    expect(result.current.phase).toBe('done');
  });

  it('saveMatch sets phase to tracking and error on failure', async () => {
    (gameStatService.PostGameStatsBulk as Mock).mockRejectedValue(new Error('network'));
    setupMocks();
    const { result } = renderHook(() => useLiveTracker(10));
    await act(async () => {});
    act(() => result.current.toggleSquadMember(1));
    act(() => result.current.startTracking());
    await act(async () => result.current.saveMatch());
    expect(result.current.phase).toBe('tracking');
    expect(result.current.error).toMatch(/failed to save/i);
  });
});
