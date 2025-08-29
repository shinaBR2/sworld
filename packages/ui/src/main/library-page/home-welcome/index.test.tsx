import { render, screen } from '@testing-library/react';
import { useAuthContext } from 'core/providers/auth';
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { Welcome } from './index';

// Mock the auth context
vi.mock('core/providers/auth', () => ({
  useAuthContext: vi.fn(),
}));

const mockUseAuthContext = useAuthContext as Mock;

describe('Welcome', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading skeleton when isLoading', () => {
    mockUseAuthContext.mockReturnValue({ user: null, isLoading: true });
    render(<Welcome />);
    expect(
      screen.getByLabelText('Welcome section loading'),
    ).toBeInTheDocument();
    expect(screen.getByTestId('welcome-title-skeleton')).toBeInTheDocument();
    expect(screen.getByTestId('welcome-subtitle-skeleton')).toBeInTheDocument();
  });

  it('should render welcome message with user name', () => {
    mockUseAuthContext.mockReturnValue({
      user: { name: 'Alice' },
      isLoading: false,
    });
    render(<Welcome />);
    expect(screen.getByLabelText('Welcome section')).toBeInTheDocument();
    expect(screen.getByText('Welcome back, Alice!')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Continue your reading journey or discover something new.',
      ),
    ).toBeInTheDocument();
  });

  it('should render fallback welcome message if user is missing', () => {
    mockUseAuthContext.mockReturnValue({ user: null, isLoading: false });
    render(<Welcome />);
    expect(screen.getByLabelText('Welcome section')).toBeInTheDocument();
    expect(screen.getByText('Welcome back, !')).toBeInTheDocument();
  });
});
