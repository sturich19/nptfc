import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EventSheet from '../components/event-sheet';
import { Player } from '../../../objects/player';

const nonGkPlayer: Player = { id: 1, nickname: 'Bob', shirt: 7, position: 2 };
const gkPlayer: Player = { id: 2, nickname: 'Dave', shirt: 1, position: 0 };

describe('EventSheet', () => {
  it('non-GK player does not see Save or Pen Save buttons', () => {
    render(
      <EventSheet open={true} player={nonGkPlayer} onEvent={vi.fn()} onClose={vi.fn()} />,
    );
    expect(screen.queryByText('Save')).not.toBeInTheDocument();
    expect(screen.queryByText('Pen Save')).not.toBeInTheDocument();
  });

  it('GK player sees Save and Pen Save buttons', () => {
    render(
      <EventSheet open={true} player={gkPlayer} onEvent={vi.fn()} onClose={vi.fn()} />,
    );
    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.getByText('Pen Save')).toBeInTheDocument();
  });

  it('tapping Goal Left calls onEvent with GOAL_LEFT and closes', async () => {
    const user = userEvent.setup();
    const onEvent = vi.fn();
    const onClose = vi.fn();
    render(
      <EventSheet open={true} player={nonGkPlayer} onEvent={onEvent} onClose={onClose} />,
    );
    await user.click(screen.getByText('Goal Left'));
    expect(onEvent).toHaveBeenCalledWith('GOAL_LEFT');
    expect(onClose).toHaveBeenCalled();
  });

  it('Cancel button calls onClose without calling onEvent', async () => {
    const user = userEvent.setup();
    const onEvent = vi.fn();
    const onClose = vi.fn();
    render(
      <EventSheet open={true} player={nonGkPlayer} onEvent={onEvent} onClose={onClose} />,
    );
    await user.click(screen.getByText('Cancel'));
    expect(onEvent).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it('shows player nickname in the heading', () => {
    render(
      <EventSheet open={true} player={gkPlayer} onEvent={vi.fn()} onClose={vi.fn()} />,
    );
    expect(screen.getByText(/Dave/)).toBeInTheDocument();
  });

  it('renders nothing when closed', () => {
    render(
      <EventSheet open={false} player={nonGkPlayer} onEvent={vi.fn()} onClose={vi.fn()} />,
    );
    expect(screen.queryByText('Goal Left')).not.toBeInTheDocument();
  });
});
