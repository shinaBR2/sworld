import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { FeelingPicker } from './feeling-picker';
import '@testing-library/jest-dom';

const feelings = [
  { id: 't1', name: 'happy' },
  { id: 't2', name: 'sad' },
  { id: 't3', name: 'calm' },
];

describe('FeelingPicker', () => {
  it('shows assigned feelings as chips and offers the rest to add', () => {
    render(
      <FeelingPicker
        assignedTagIds={['t1']}
        feelings={feelings}
        onAssign={vi.fn()}
        onUnassign={vi.fn()}
      />,
    );

    expect(screen.getByText('happy')).toBeInTheDocument();
    expect(screen.queryByText('sad')).not.toBeInTheDocument();

    // The unassigned feelings appear only in the add menu, once opened.
    fireEvent.click(screen.getByText('Add feeling'));
    expect(screen.getByText('sad')).toBeInTheDocument();
    expect(screen.getByText('calm')).toBeInTheDocument();
  });

  it('assigns a feeling picked from the add menu', () => {
    const onAssign = vi.fn();
    render(
      <FeelingPicker
        assignedTagIds={[]}
        feelings={feelings}
        onAssign={onAssign}
        onUnassign={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByText('Add feeling'));
    fireEvent.click(screen.getByText('calm'));

    expect(onAssign).toHaveBeenCalledWith('t3');
  });

  it('unassigns a feeling when its chip is deleted', () => {
    const onUnassign = vi.fn();
    render(
      <FeelingPicker
        assignedTagIds={['t2']}
        feelings={feelings}
        onAssign={vi.fn()}
        onUnassign={onUnassign}
      />,
    );

    // MUI renders the chip delete affordance as a CancelIcon button.
    fireEvent.click(screen.getByTestId('CancelIcon'));

    expect(onUnassign).toHaveBeenCalledWith('t2');
  });

  it('shows an empty hint and no add menu when all feelings are assigned', () => {
    render(
      <FeelingPicker
        assignedTagIds={['t1', 't2', 't3']}
        feelings={feelings}
        onAssign={vi.fn()}
        onUnassign={vi.fn()}
      />,
    );

    expect(screen.queryByText('Add feeling')).not.toBeInTheDocument();
  });
});
