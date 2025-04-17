import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Notification } from './index';

describe('Notification', () => {
  const mockNotification = {
    message: 'Test message',
    severity: 'success' as const,
  };

  const defaultProps = {
    notification: mockNotification,
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('renders notification with correct message and severity', () => {
    render(<Notification {...defaultProps} />);

    expect(screen.getByText(mockNotification.message)).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveClass(`MuiAlert-colorSuccess`);
  });

  it('renders notifications with different severities', () => {
    const severities: Array<'success' | 'error' | 'warning' | 'info'> = ['success', 'error', 'warning', 'info'];

    severities.forEach(severity => {
      const { rerender } = render(
        <Notification notification={{ ...mockNotification, severity }} onClose={defaultProps.onClose} />
      );

      expect(screen.getByRole('alert')).toHaveClass(
        `MuiAlert-color${severity.charAt(0).toUpperCase() + severity.slice(1)}`
      );
      rerender(<></>);
    });
  });

  it('calls onClose when close button is clicked', () => {
    render(<Notification {...defaultProps} />);

    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('auto hides after duration', () => {
    render(<Notification {...defaultProps} />);

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('does not render Alert when notification is null', () => {
    render(<Notification notification={null as any} onClose={defaultProps.onClose} />);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
