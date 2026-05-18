import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import LiveFixtureList, { filterUpcomingFixtures } from '../live-fixture-list';
import * as tigersFixtureService from '../../../services/tigers-fixture-service';
import { TigersFixture } from '../../../objects/tigers-fixture';

vi.mock('../../../services/tigers-fixture-service');

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

const makeFixture = (id: number, daysFromNow: number): TigersFixture => {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return {
    id,
    homeTeam: `Home${id}`,
    awayTeam: `Away${id}`,
    homeTeamScore: 0,
    awayTeamScore: 0,
    date: d,
    result: 0,
    location: 0,
    seasonId: 1,
    type: 0,
    pts: 0,
    glsFor: 0,
    glsA: 0,
  };
};

const renderFixtureList = () =>
  render(<BrowserRouter><LiveFixtureList /></BrowserRouter>);

describe('LiveFixtureList', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('shows loading indicator while fixtures are being fetched', () => {
    (tigersFixtureService.GetTigersFixtures as Mock).mockReturnValue(new Promise(() => {}));
    renderFixtureList();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('shows error message when fixture fetch fails', async () => {
    (tigersFixtureService.GetTigersFixtures as Mock).mockRejectedValue(new Error('network'));
    renderFixtureList();
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
    expect(screen.getByText(/failed to load fixtures/i)).toBeInTheDocument();
  });

  it('renders fixture cards with home and away team names', async () => {
    (tigersFixtureService.GetTigersFixtures as Mock).mockResolvedValue([makeFixture(1, 1)]);
    renderFixtureList();
    await waitFor(() => expect(screen.getByText(/Home1/)).toBeInTheDocument());
    expect(screen.getByText(/Away1/)).toBeInTheDocument();
  });

  it('shows no upcoming fixtures message when list is empty', async () => {
    (tigersFixtureService.GetTigersFixtures as Mock).mockResolvedValue([]);
    renderFixtureList();
    await waitFor(() =>
      expect(screen.getByText(/no upcoming fixtures/i)).toBeInTheDocument(),
    );
  });

  it('navigates to live tracker when a fixture card is clicked', async () => {
    const user = userEvent.setup();
    (tigersFixtureService.GetTigersFixtures as Mock).mockResolvedValue([makeFixture(42, 1)]);
    renderFixtureList();
    await waitFor(() => expect(screen.getByText(/Home42/)).toBeInTheDocument());
    await user.click(screen.getByText(/Home42/));
    expect(mockNavigate).toHaveBeenCalledWith('/live/42');
  });
});

describe('filterUpcomingFixtures', () => {
  const today = new Date('2025-06-10T12:00:00');

  const make = (id: number, dateStr: string): TigersFixture => ({
    id,
    homeTeam: 'A', awayTeam: 'B',
    homeTeamScore: 0, awayTeamScore: 0,
    date: new Date(dateStr),
    result: 0, location: 0, seasonId: 1, type: 0, pts: 0, glsFor: 0, glsA: 0,
  });

  it('returns fixtures within 28-day window sorted by date', () => {
    const fixtures = [
      make(1, '2025-06-12'),
      make(2, '2025-06-20'),
      make(3, '2025-07-15'), // outside window
    ];
    const result = filterUpcomingFixtures(fixtures, today);
    expect(result.map(f => f.id)).toEqual([1, 2]);
  });

  it('falls back to 3 most recent past fixtures when no upcoming', () => {
    const fixtures = [
      make(1, '2025-06-01'),
      make(2, '2025-05-15'),
      make(3, '2025-05-01'),
      make(4, '2025-04-01'),
    ];
    const result = filterUpcomingFixtures(fixtures, today);
    expect(result).toHaveLength(3);
    expect(result[0].id).toBe(1); // most recent first
  });

  it('includes today\'s fixture in the upcoming window', () => {
    const fixtures = [make(5, '2025-06-10')]; // same day
    const result = filterUpcomingFixtures(fixtures, today);
    expect(result.map(f => f.id)).toContain(5);
  });
});
