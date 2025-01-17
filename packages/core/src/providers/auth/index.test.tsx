import { describe, expect, test, beforeEach, vi } from 'vitest';
import { renderHook, act, RenderHookResult } from '@testing-library/react';
import { User } from '@auth0/auth0-react';
import { AuthContextValue, AuthProvider, useAuthContext } from '.';

interface Auth0ContextInterface {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null | undefined;
  getAccessTokenSilently: () => Promise<string>;
  loginWithRedirect: () => Promise<void>;
  logout: (options: { logoutParams: { returnTo: string } }) => Promise<void>;
}

const mockUseAuth0 = vi.fn<() => Auth0ContextInterface>();

vi.mock('@auth0/auth0-react', () => ({
  Auth0Provider: ({ children }: { children: React.ReactNode }) => children,
  useAuth0: () => mockUseAuth0(),
}));

const createMockToken = (claims: Record<string, unknown>): string => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(
    JSON.stringify({
      'https://hasura.io/jwt/claims': claims,
    })
  );
  return `${header}.${payload}.mock_signature`;
};

const mockConfig = {
  domain: 'test.auth0.com',
  clientId: 'test-client-id',
  audience: 'test-audience',
  redirectUri: 'http://localhost:3000',
  cookieDomain: 'localhost',
};

const mockUser: User = {
  sub: 'auth0|123',
  email: 'test@example.com',
  email_verified: true,
  name: 'Test User',
  nickname: 'testuser',
  picture: 'https://example.com/picture.jpg',
  updated_at: '2023-01-01T00:00:00.000Z',
};

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('provides default context when not authenticated', async () => {
    // Create mock functions using Vitest
    const getAccessTokenSilently = vi
      .fn()
      .mockResolvedValue('') as () => Promise<string>;
    const loginWithRedirect = vi
      .fn()
      .mockResolvedValue(undefined) as () => Promise<void>;
    const logout = vi.fn().mockResolvedValue(undefined) as () => Promise<void>;

    mockUseAuth0.mockImplementation(() => ({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      getAccessTokenSilently,
      loginWithRedirect,
      logout,
    }));

    // Wrapper component
    function Wrapper({ children }: { children: React.ReactNode }) {
      return <AuthProvider config={mockConfig}>{children}</AuthProvider>;
    }

    let renderResult: RenderHookResult<AuthContextValue, unknown>;
    await act(async () => {
      renderResult = renderHook(() => useAuthContext(), { wrapper: Wrapper });
    });

    await act(async () => {
      await vi.waitFor(() => {
        expect(renderResult.result.current).toEqual(
          expect.objectContaining({
            isSignedIn: false,
            isLoading: false,
            user: null,
            isAdmin: false,
          })
        );
      });
    });
  });

  test('handles successful authentication', async () => {
    const mockClaims = {
      'x-hasura-default-role': 'user',
      'x-hasura-allowed-roles': ['user'],
      'x-hasura-user-id': 'db-user-123',
    };

    const mockToken = createMockToken(mockClaims);
    const getAccessTokenSilently = vi
      .fn()
      .mockResolvedValue(mockToken) as () => Promise<string>;
    const loginWithRedirect = vi
      .fn()
      .mockResolvedValue(undefined) as () => Promise<void>;
    const logout = vi.fn().mockResolvedValue(undefined) as () => Promise<void>;

    mockUseAuth0.mockImplementation(() => ({
      isAuthenticated: true,
      isLoading: false,
      user: mockUser,
      getAccessTokenSilently,
      loginWithRedirect,
      logout,
    }));

    function Wrapper({ children }: { children: React.ReactNode }) {
      return <AuthProvider config={mockConfig}>{children}</AuthProvider>;
    }

    let renderResult: RenderHookResult<AuthContextValue, unknown>;
    await act(async () => {
      renderResult = renderHook(() => useAuthContext(), { wrapper: Wrapper });
    });

    await act(async () => {
      await vi.waitFor(() => {
        expect(renderResult.result.current).toEqual(
          expect.objectContaining({
            isSignedIn: true,
            isLoading: false,
            user: expect.objectContaining({
              id: 'db-user-123',
              email: mockUser.email,
              name: mockUser.name,
              picture: mockUser.picture,
            }),
            isAdmin: false,
          })
        );
      });
    });
  });

  test('identifies admin users correctly', async () => {
    const mockClaims = {
      'x-hasura-default-role': 'admin',
      'x-hasura-allowed-roles': ['admin', 'user'],
      'x-hasura-user-id': 'db-user-123',
    };

    const mockToken = createMockToken(mockClaims);
    const getAccessTokenSilently = vi
      .fn()
      .mockResolvedValue(mockToken) as () => Promise<string>;
    const loginWithRedirect = vi
      .fn()
      .mockResolvedValue(undefined) as () => Promise<void>;
    const logout = vi.fn().mockResolvedValue(undefined) as () => Promise<void>;

    mockUseAuth0.mockImplementation(() => ({
      isAuthenticated: true,
      isLoading: false,
      user: mockUser,
      getAccessTokenSilently,
      loginWithRedirect,
      logout,
    }));

    function Wrapper({ children }: { children: React.ReactNode }) {
      return <AuthProvider config={mockConfig}>{children}</AuthProvider>;
    }

    let renderResult: RenderHookResult<AuthContextValue, unknown>;
    await act(async () => {
      renderResult = renderHook(() => useAuthContext(), { wrapper: Wrapper });
    });

    await act(async () => {
      await vi.waitFor(() => {
        expect(renderResult.result.current).toEqual(
          expect.objectContaining({
            isSignedIn: true,
            isLoading: false,
            user: expect.objectContaining({
              id: 'db-user-123',
              email: mockUser.email,
              name: mockUser.name,
              picture: mockUser.picture,
            }),
            isAdmin: true,
          })
        );
      });
    });
  });

  test('should check session on mount', async () => {
    const mockToken = createMockToken({
      'x-hasura-default-role': 'user',
      'x-hasura-user-id': 'db-user',
    });
    const mockGetAccessTokenSilently = vi.fn().mockResolvedValue(mockToken);

    mockUseAuth0.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: mockUser,
      getAccessTokenSilently: mockGetAccessTokenSilently,
      loginWithRedirect: vi.fn(),
      logout: vi.fn(),
    });

    let renderResult: RenderHookResult<AuthContextValue, unknown>;
    await act(async () => {
      renderResult = renderHook(() => useAuthContext(), {
        wrapper: ({ children }) => (
          <AuthProvider config={mockConfig}>{children}</AuthProvider>
        ),
      });
    });

    await act(async () => {
      await vi.waitFor(() => {
        expect(renderResult.result.current.isSignedIn).toBe(true);

        // Verify session check was called
        expect(mockGetAccessTokenSilently).toHaveBeenCalled();
      });
    });
  });

  test('should handle session check failure', async () => {
    const mockGetAccessTokenSilently = vi
      .fn()
      .mockRejectedValue(new Error('Session expired'));

    mockUseAuth0.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: null,
      getAccessTokenSilently: mockGetAccessTokenSilently,
      loginWithRedirect: vi.fn(),
      logout: vi.fn(),
    });

    let renderResult: RenderHookResult<AuthContextValue, unknown>;
    await act(async () => {
      renderResult = renderHook(() => useAuthContext(), {
        wrapper: ({ children }) => (
          <AuthProvider config={mockConfig}>{children}</AuthProvider>
        ),
      });
    });

    await act(async () => {
      await vi.waitFor(() => {
        expect(renderResult.result.current.isSignedIn).toBe(false);
        expect(renderResult.result.current.user).toBeNull();
        expect(mockGetAccessTokenSilently).toHaveBeenCalled();
      });
    });
  });

  test('should handle invalid claims format', async () => {
    const invalidToken = btoa(
      JSON.stringify({
        // Missing hasura namespace
        'x-hasura-default-role': 'user',
        'x-hasura-allowed-roles': ['user'],
        'x-hasura-user-id': 'test-id',
      })
    );

    const mockGetAccessTokenSilently = vi.fn().mockResolvedValue(invalidToken);

    mockUseAuth0.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: null,
      getAccessTokenSilently: mockGetAccessTokenSilently,
      loginWithRedirect: vi.fn(),
      logout: vi.fn(),
    });

    let renderResult: RenderHookResult<AuthContextValue, unknown>;
    await act(async () => {
      renderResult = renderHook(() => useAuthContext(), {
        wrapper: ({ children }) => (
          <AuthProvider config={mockConfig}>{children}</AuthProvider>
        ),
      });
    });

    await act(async () => {
      await vi.waitFor(() => {
        expect(mockGetAccessTokenSilently).toHaveBeenCalled();
        expect(renderResult.result.current.isSignedIn).toBe(false);
        expect(renderResult.result.current.user).toBeNull();
      });
    });
  });

  test('should not call getAccessTokenSilently when not signed in', async () => {
    const mockGetAccessTokenSilently = vi.fn();

    mockUseAuth0.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      getAccessTokenSilently: mockGetAccessTokenSilently,
      loginWithRedirect: vi.fn(),
      logout: vi.fn(),
    });

    let renderResult: RenderHookResult<AuthContextValue, unknown>;
    await act(async () => {
      renderResult = renderHook(() => useAuthContext(), {
        wrapper: ({ children }) => (
          <AuthProvider config={mockConfig}>{children}</AuthProvider>
        ),
      });
    });

    await act(async () => {
      await vi.waitFor(() => {
        expect(mockGetAccessTokenSilently).not.toHaveBeenCalled();
        expect(renderResult.result.current.isSignedIn).toBe(false);
      });
    });
  });
});
