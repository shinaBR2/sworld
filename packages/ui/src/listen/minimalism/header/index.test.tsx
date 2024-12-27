import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Header } from './index';
import '@testing-library/jest-dom';

// Mock the child components
vi.mock('../../../universal/logo', () => ({
  default: () => <div data-testid="mock-logo">Logo</div>,
}));

vi.mock('../../../universal/site-choices', () => ({
  default: () => <div data-testid="mock-site-choices">SiteChoices</div>,
}));

describe('Header', () => {
  const defaultProps = {
    toggleSetting: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders logo and site choices', () => {
    render(<Header {...defaultProps} />);

    expect(screen.getByTestId('mock-logo')).toBeInTheDocument();
    expect(screen.getByTestId('mock-site-choices')).toBeInTheDocument();
  });

  it('renders account circle button', () => {
    render(<Header {...defaultProps} />);

    const accountButton = screen
      .getByTestId('AccountCircleIcon')
      .closest('button');
    expect(accountButton).toBeInTheDocument();
  });

  it('calls toggleSetting with true when account button is clicked', () => {
    render(<Header {...defaultProps} />);

    const accountButton = screen
      .getByTestId('AccountCircleIcon')
      .closest('button');
    fireEvent.click(accountButton as Element);

    expect(defaultProps.toggleSetting).toHaveBeenCalledTimes(1);
    expect(defaultProps.toggleSetting).toHaveBeenCalledWith(true);
  });

  it('has correct MUI styling for AppBar', () => {
    render(<Header {...defaultProps} />);

    const appBar = screen.getByRole('banner');
    expect(appBar).toHaveClass('MuiAppBar-positionSticky');
    expect(appBar).toHaveClass('MuiAppBar-colorDefault');
    expect(appBar).toHaveStyle({ boxShadow: 'none' }); // elevation={0}
  });

  it('has correct layout structure', () => {
    render(<Header {...defaultProps} />);

    // Check if Toolbar exists with correct styling
    const toolbar = document.querySelector('.MuiToolbar-root');
    expect(toolbar).toBeInTheDocument();

    // Check logo and site choices are in the first box
    const leftBox = screen.getByTestId('mock-logo').closest('.MuiBox-root');
    expect(leftBox).toContainElement(screen.getByTestId('mock-site-choices'));

    // Check account button is in a separate box
    const rightBox = screen
      .getByTestId('AccountCircleIcon')
      .closest('.MuiBox-root');
    expect(rightBox).not.toBe(leftBox);
  });
});