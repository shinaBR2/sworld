import { render, screen } from '@testing-library/react';
import { Mock, beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthRoute } from './index';
import { useAuthContext } from 'core/providers/auth';
import { LoginDialog } from '../dialogs/login';

// Mock the auth context
vi.mock('core/providers/auth', () => ({
  useAuthContext: vi.fn(),
}));

vi.mock('../dialogs/login', () => ({
  LoginDialog: vi.fn(() => <div data-testid="mock-login-dialog" />),
}));

describe('AuthRoute', () => {
  const mockUseAuthContext = useAuthContext as Mock;
  const mockLoginDialog = LoginDialog as Mock;
  const defaultAuthContext = {
    isSignedIn: true,
    isLoading: false,
    signIn: vi.fn(),
  };

  beforeEach(() => {
    mockUseAuthContext.mockReturnValue(defaultAuthContext);
    mockLoginDialog.mockClear();
  });

  it('renders children when user is authenticated', () => {
    render(
      <AuthRoute>
        <div data-testid="test-content">Protected Content</div>
      </AuthRoute>
    );

    expect(screen.getByTestId('test-content')).toBeInTheDocument();
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('shows loading backdrop when authentication is loading', () => {
    mockUseAuthContext.mockReturnValue({
      ...defaultAuthContext,
      isLoading: true,
    });

    render(
      <AuthRoute>
        <div>Protected Content</div>
      </AuthRoute>
    );

    expect(screen.getByText('Valuable things deserve waiting')).toBeInTheDocument();
  });

  it('shows login dialog when user is not authenticated', () => {
    const signIn = vi.fn();
    mockUseAuthContext.mockReturnValue({
      ...defaultAuthContext,
      isSignedIn: false,
      signIn,
    });

    render(
      <AuthRoute>
        <div>Protected Content</div>
      </AuthRoute>
    );

    expect(screen.getByTestId('mock-login-dialog')).toBeInTheDocument();
    expect(mockLoginDialog).toHaveBeenCalledWith({ onAction: signIn }, {});

    // Test sign in functionality
    // const signInButton = screen.getByRole('button', { name: /sign in/i });
    // signInButton.click();
    // expect(signIn).toHaveBeenCalledTimes(1);
  });

  it('does not render children when not authenticated', () => {
    mockUseAuthContext.mockReturnValue({
      ...defaultAuthContext,
      isSignedIn: false,
    });

    render(
      <AuthRoute>
        <div data-testid="test-content">Protected Content</div>
      </AuthRoute>
    );

    expect(screen.queryByTestId('test-content')).not.toBeInTheDocument();
  });
});
