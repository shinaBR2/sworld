import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SettingsPanel } from '.';
import '@testing-library/jest-dom';

describe('SettingsPanel', () => {
  const defaultProps = {
    open: true,
    toggle: vi.fn(),
    actions: {
      logout: vi.fn(),
    },
  };

  it('renders the logout option when open', () => {
    render(<SettingsPanel {...defaultProps} />);

    expect(screen.getByText('Logout')).toBeInTheDocument();
    expect(screen.getByTestId('LogoutIcon')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<SettingsPanel {...defaultProps} open={false} />);

    expect(screen.queryByText('Logout')).not.toBeInTheDocument();
  });

  it('closes the drawer and calls logout when the logout option is clicked', () => {
    render(<SettingsPanel {...defaultProps} />);

    fireEvent.click(screen.getByText('Logout'));

    expect(defaultProps.toggle).toHaveBeenCalledWith(false);
    expect(defaultProps.actions.logout).toHaveBeenCalledTimes(1);
  });

  it('calls toggle with false when the drawer backdrop is clicked', () => {
    render(<SettingsPanel {...defaultProps} />);

    const backdrop = screen.getByRole('presentation').firstChild;
    fireEvent.click(backdrop as Element);

    expect(defaultProps.toggle).toHaveBeenCalledWith(false);
  });
});
