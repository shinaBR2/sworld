import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SettingsPanel } from '.';
import '@testing-library/jest-dom';

vi.mock('./upload-button', () => ({
  UploadButton: () => <div data-testid="mock-upload-button">Upload Button</div>,
}));

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

    // Check if logout button is rendered
    const logoutButton = screen.getByText('Logout');
    expect(logoutButton).toBeInTheDocument();

    // Check if logout icon is present
    const logoutIcon = screen.getByTestId('LogoutIcon');
    expect(logoutIcon).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<SettingsPanel {...defaultProps} open={false} />);

    // Check if logout button is not rendered
    const logoutButton = screen.queryByText('Logout');
    expect(logoutButton).not.toBeInTheDocument();
  });

  it('calls logout function when logout button is clicked', () => {
    render(<SettingsPanel {...defaultProps} />);

    // Click logout button
    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);

    // Check if logout function was called
    expect(defaultProps.actions.logout).toHaveBeenCalledTimes(1);
  });

  it('renders the standalone toggle reflecting the current value', () => {
    render(<SettingsPanel {...defaultProps} standaloneMode={true} />);

    const toggle = screen.getByLabelText('Standalone mode');
    expect(toggle).toBeChecked();
  });

  it('reports standalone toggle changes', () => {
    const onStandaloneModeChange = vi.fn();
    render(
      <SettingsPanel
        {...defaultProps}
        standaloneMode={false}
        onStandaloneModeChange={onStandaloneModeChange}
      />,
    );

    fireEvent.click(screen.getByLabelText('Standalone mode'));
    expect(onStandaloneModeChange).toHaveBeenCalledWith(true);
  });

  it('disables the standalone toggle while saving', () => {
    render(
      <SettingsPanel {...defaultProps} standaloneMode={false} saving={true} />,
    );

    expect(screen.getByLabelText('Standalone mode')).toBeDisabled();
  });

  it('calls toggle function when drawer is closed', () => {
    render(<SettingsPanel {...defaultProps} />);

    // Find the backdrop (overlay) of the drawer
    const backdrop = screen.getByRole('presentation').firstChild;
    fireEvent.click(backdrop as Element);

    // Check if toggle function was called with false
    expect(defaultProps.toggle).toHaveBeenCalledWith(false);
  });
});
