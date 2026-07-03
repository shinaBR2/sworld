import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { StandaloneConflictDialog } from '.';
import '@testing-library/jest-dom';

describe('StandaloneConflictDialog', () => {
  const defaultProps = {
    open: true,
    deviceMode: true,
    accountMode: false,
    onChoose: vi.fn(),
  };

  it('does not render when closed', () => {
    render(<StandaloneConflictDialog {...defaultProps} open={false} />);
    expect(
      screen.queryByText('Which mode do you want?'),
    ).not.toBeInTheDocument();
  });

  it('chooses the device mode', () => {
    const onChoose = vi.fn();
    render(<StandaloneConflictDialog {...defaultProps} onChoose={onChoose} />);

    fireEvent.click(screen.getByText(/This device:/));
    expect(onChoose).toHaveBeenCalledWith(true);
  });

  it('chooses the account mode', () => {
    const onChoose = vi.fn();
    render(<StandaloneConflictDialog {...defaultProps} onChoose={onChoose} />);

    fireEvent.click(screen.getByText(/Account:/));
    expect(onChoose).toHaveBeenCalledWith(false);
  });

  it('disables both choices while saving', () => {
    render(<StandaloneConflictDialog {...defaultProps} saving={true} />);

    expect(screen.getByText(/This device:/).closest('button')).toBeDisabled();
    expect(screen.getByText(/Account:/).closest('button')).toBeDisabled();
  });
});
