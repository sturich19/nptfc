import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import SquadSetup from '../components/squad-setup';
import { UseLiveTrackerResult } from '../hooks/use-live-tracker';
import { Player } from '../../../objects/player';

const makePlayers = (): Player[] => [
  { id: 1, nickname: 'Alice', shirt: 10, position: 1 },
  { id: 2, nickname: 'Bob', shirt: 1, position: 0 },
  { id: 3, nickname: 'Charlie', shirt: 7, position: 2 },
];

const makeTracker = (
  overrides: Partial<UseLiveTrackerResult> = {},
): UseLiveTrackerResult => ({
  phase: 'setup',
  fixture: null,
  players: makePlayers(),
  squadIds: new Set<number>(),
  stats: new Map(),
  eventLog: [],
  isLoading: false,
  error: null,
  toggleSquadMember: vi.fn(),
  startTracking: vi.fn(),
  addEvent: vi.fn(),
  undoLastEvent: vi.fn(),
  saveMatch: vi.fn(),
  backToSetup: vi.fn(),
  ...overrides,
});

const renderSetup = (tracker: UseLiveTrackerResult) =>
  render(<BrowserRouter><SquadSetup tracker={tracker} /></BrowserRouter>);

describe('SquadSetup', () => {
  it('players are sorted by shirt number ascending', () => {
    const tracker = makeTracker();
    renderSetup(tracker);
    const bodyText = document.body.textContent ?? '';
    const pos1 = bodyText.indexOf('#1 ');
    const pos7 = bodyText.indexOf('#7 ');
    const pos10 = bodyText.indexOf('#10 ');
    expect(pos1).toBeGreaterThan(-1);
    expect(pos7).toBeGreaterThan(-1);
    expect(pos10).toBeGreaterThan(-1);
    expect(pos1).toBeLessThan(pos7);
    expect(pos7).toBeLessThan(pos10);
  });

  it('Start Tracking button is disabled when no players selected', () => {
    const tracker = makeTracker({ squadIds: new Set() });
    renderSetup(tracker);
    expect(screen.getByRole('button', { name: /Start Tracking/i })).toBeDisabled();
  });

  it('Start Tracking button is enabled when at least one player selected', () => {
    const tracker = makeTracker({ squadIds: new Set([1]) });
    renderSetup(tracker);
    expect(screen.getByRole('button', { name: /Start Tracking/i })).not.toBeDisabled();
  });

  it('Start Tracking button shows selected player count', () => {
    const tracker = makeTracker({ squadIds: new Set([1, 2]) });
    renderSetup(tracker);
    expect(screen.getByRole('button', { name: /2 players/i })).toBeInTheDocument();
  });

  it('players with existing squad selection are pre-checked', () => {
    const tracker = makeTracker({ squadIds: new Set([2]) });
    renderSetup(tracker);
    const checkboxes = screen.getAllByRole('checkbox');
    const checked = checkboxes.filter(cb => (cb as HTMLInputElement).checked);
    expect(checked).toHaveLength(1);
  });

  it('clicking a player row calls toggleSquadMember with that player id', async () => {
    const user = userEvent.setup();
    const toggleSquadMember = vi.fn();
    const tracker = makeTracker({ toggleSquadMember });
    renderSetup(tracker);
    // Click the row for Bob (shirt 1, first in sorted order)
    await user.click(screen.getByText(/Bob/));
    expect(toggleSquadMember).toHaveBeenCalledWith(2);
  });

  it('clicking Start Tracking calls startTracking', async () => {
    const user = userEvent.setup();
    const startTracking = vi.fn();
    const tracker = makeTracker({ squadIds: new Set([1]), startTracking });
    renderSetup(tracker);
    await user.click(screen.getByRole('button', { name: /Start Tracking/i }));
    expect(startTracking).toHaveBeenCalled();
  });
});
