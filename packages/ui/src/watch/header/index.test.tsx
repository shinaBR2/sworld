import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Header } from './index';
import '@testing-library/jest-dom';

// Mock the child components
vi.mock('../../universal/logo', () => ({
  default: () => <div data-testid="mock-logo">Logo</div>,
}));

vi.mock('../../universal/search-bar', () => ({
  default: () => <div data-testid="mock-search-bar">SearchBar</div>,
}));

vi.mock('../../universal/site-choices', () => ({
  default: () => <div data-testid="mock-site-choices">SiteChoices</div>,
}));

describe('Header', () => {
  const defaultProps = {
    toggleSetting: vi.fn(),
  };

  it('renders all components correctly', () => {
    render(<Header {...defaultProps} />);

    // Check if all components are rendered
    expect(screen.getByTestId('mock-logo')).toBeInTheDocument();
    expect(screen.getByTestId('mock-search-bar')).toBeInTheDocument();
    expect(screen.getByTestId('mock-site-choices')).toBeInTheDocument();

    // Check if account button is rendered
    const accountButton = screen
      .getByTestId('AccountCircleIcon')
      .closest('button');
    expect(accountButton).toBeInTheDocument();
  });

  it('calls toggleSetting when account button is clicked', () => {
    render(<Header {...defaultProps} />);

    // Find and click the account button
    const accountButton = screen
      .getByTestId('AccountCircleIcon')
      .closest('button');
    fireEvent.click(accountButton as Element);

    // Check if toggleSetting was called with true
    expect(defaultProps.toggleSetting).toHaveBeenCalledWith(true);
  });

  it('maintains correct layout structure', () => {
    render(<Header {...defaultProps} />);

    // Check if AppBar is rendered with correct position
    const appBar = screen.getByRole('banner');

    expect(appBar).toHaveClass('MuiAppBar-positionSticky');

    // Check if Toolbar is rendered
    const toolbar = appBar.querySelector('.MuiToolbar-root');
    expect(toolbar).toBeInTheDocument();

    // Check if the three main sections are rendered with correct layout
    const boxes = document.querySelectorAll('.MuiBox-root');
    expect(boxes).toHaveLength(3);

    // Check if middle box (search bar container) has flex: 1
    const searchBarContainer = boxes[1];
    expect(searchBarContainer).toHaveStyle({ flex: '1' });
  });

  it('renders without elevation', () => {
    render(<Header {...defaultProps} />);

    const appBar = screen.getByRole('banner');
    expect(appBar).toHaveStyle({ boxShadow: 'none' });
  });

  it('uses default color', () => {
    render(<Header {...defaultProps} />);

    const appBar = screen.getByRole('banner');
    expect(appBar).toHaveClass('MuiAppBar-colorDefault');
  });
});