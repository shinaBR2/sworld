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

  it('renders correctly when open', () => {
    render(<SettingsPanel {...defaultProps} />);

    const logoutButton = screen.getByText('Logout');
    expect(logoutButton).toBeInTheDocument();

    const logoutIcon = screen.getByTestId('LogoutIcon');
    expect(logoutIcon).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<SettingsPanel {...defaultProps} open={false} />);

    const logoutButton = screen.queryByText('Logout');
    expect(logoutButton).not.toBeInTheDocument();
  });

  it('calls logout function when logout button is clicked', () => {
    render(<SettingsPanel {...defaultProps} />);

    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);

    expect(defaultProps.actions.logout).toHaveBeenCalledTimes(1);
  });

  it('renders manage library button when manage action is provided', () => {
    const manage = vi.fn();
    render(
      <SettingsPanel {...defaultProps} actions={{ logout: vi.fn(), manage }} />,
    );

    const manageButton = screen.getByText('Manage library');
    expect(manageButton).toBeInTheDocument();

    fireEvent.click(manageButton);
    expect(manage).toHaveBeenCalledTimes(1);
  });

  it('does not render manage library button when manage action is omitted', () => {
    render(<SettingsPanel {...defaultProps} />);

    expect(screen.queryByText('Manage library')).not.toBeInTheDocument();
  });

  it('calls toggle function when drawer is closed', () => {
    render(<SettingsPanel {...defaultProps} />);

    const backdrop = screen.getByRole('presentation').firstChild;
    fireEvent.click(backdrop as Element);

    expect(defaultProps.toggle).toHaveBeenCalledWith(false);
  });
});
