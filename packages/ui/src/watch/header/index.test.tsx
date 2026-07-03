import { act, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Header } from './index';
import '@testing-library/jest-dom';
import { Link } from '@mui/material';

// Mock the child components
vi.mock('../../universal/logo', () => ({
  default: () => <div data-testid="mock-logo">Logo</div>,
}));

vi.mock('../../universal/site-choices', () => ({
  default: () => <div data-testid="mock-site-choices">SiteChoices</div>,
}));

vi.mock('./notifications', () => ({
  default: () => <div data-testid="mock-notifications">Notifications</div>,
}));

vi.mock('core/providers/auth', () => ({
  useAuthContext: vi.fn().mockReturnValue({
    isSignedIn: false,
  }),
}));

describe('Header', () => {
  const defaultProps = {
    toggleSetting: vi.fn(),
    sites: {
      listen: 'listen',
      watch: 'watch',
      play: 'play',
      til: 'til',
    },
    user: null,
    LinkComponent: Link,
    linkProps: {
      to: '/',
    },
  };

  it('renders all components correctly', async () => {
    await act(async () => {
      render(<Header {...defaultProps} />);
    });

    expect(await screen.findByTestId('mock-notifications')).toBeInTheDocument();
    expect(screen.getByTestId('mock-logo')).toBeInTheDocument();
    expect(screen.getByTestId('mock-site-choices')).toBeInTheDocument();
  });

  it('renders account circle button for anonymous visitors', async () => {
    await act(async () => {
      render(<Header {...defaultProps} />);
    });

    expect(await screen.findByTestId('AccountCircleIcon')).toBeInTheDocument();
  });

  it('maintains correct layout structure', async () => {
    await act(async () => {
      render(<Header {...defaultProps} />);
    });

    const appBar = await screen.findByRole('banner');

    expect(appBar).toHaveClass('MuiAppBar-positionSticky');

    // Check if Toolbar is rendered
    const toolbar = appBar.querySelector('.MuiToolbar-root');
    expect(toolbar).toBeInTheDocument();

    // Check if the three main sections are rendered with correct layout
    const boxes = document.querySelectorAll('.MuiBox-root');
    expect(boxes).toHaveLength(2);
  });

  it('renders without elevation', () => {
    render(<Header {...defaultProps} />);

    const appBar = screen.getByRole('banner');
    // elevation={0} → MUI applies the Paper elevation-0 class (v6 renders it
    // via an emotion class, not an inline box-shadow, so assert the class).
    expect(appBar).toHaveClass('MuiPaper-elevation0');
  });

  it('uses default color', () => {
    render(<Header {...defaultProps} />);

    const appBar = screen.getByRole('banner');
    expect(appBar).toHaveClass('MuiAppBar-colorDefault');
  });
});
