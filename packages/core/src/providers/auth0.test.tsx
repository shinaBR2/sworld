import { describe, expect, test, jest, beforeEach } from '@jest/globals';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { User } from '@auth0/auth0-react';
import { AuthProvider, useAuthContext } from './auth0';

// First, let's define our Auth0 context types more precisely
interface Auth0ContextInterface {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null | undefined;
  getAccessTokenSilently: () => Promise<string>;
  loginWithRedirect: () => Promise<void>;
  logout: (options: { logoutParams: { returnTo: string } }) => Promise<void>;
}

// Create a properly typed mock function
const mockUseAuth0 = jest.fn<() => Auth0ContextInterface>();

// Now we mock the module with proper types
jest.mock('@auth0/auth0-react', () => ({
  Auth0Provider: function MockAuth0Provider({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return <>{children}</>;
  },
  useAuth0: () => mockUseAuth0(),
}));

// Helper to create JWT token
const createMockToken = (claims: Record<string, unknown>): string => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(
    JSON.stringify({
      'https://hasura.io/jwt/claims': claims,
    })
  );
  return `${header}.${payload}.mock_signature`;
};

// Configuration for our tests
const mockConfig = {
  domain: 'test.auth0.com',
  clientId: 'test-client-id',
  audience: 'test-audience',
  redirectUri: 'http://localhost:3000',
};

// Mock user with proper User type
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
    mockUseAuth0.mockClear();
  });

  test('provides default context when not authenticated', async () => {
    // Create properly typed mock functions for each Auth0 method
    const getAccessTokenSilently = jest
      .fn()
      .mockImplementation(() => Promise.resolve('')) as () => Promise<string>;
    const loginWithRedirect = jest
      .fn()
      .mockImplementation(() => Promise.resolve()) as () => Promise<void>;
    const logout = jest
      .fn()
      .mockImplementation(() => Promise.resolve()) as () => Promise<void>;

    mockUseAuth0.mockImplementation(() => ({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      getAccessTokenSilently,
      loginWithRedirect,
      logout,
    }));

    // Create a wrapper component
    function Wrapper({ children }: { children: React.ReactNode }) {
      return <AuthProvider config={mockConfig}>{children}</AuthProvider>;
    }

    const { result } = renderHook(() => useAuthContext(), { wrapper: Wrapper });

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current).toEqual(
      expect.objectContaining({
        isSignedIn: false,
        isLoading: false,
        user: null,
        isAdmin: false,
      })
    );
  });

  test('handles successful authentication', async () => {
    const mockClaims = {
      'x-hasura-default-role': 'user',
      'x-hasura-allowed-roles': ['user'],
      'x-hasura-user-id': 'db-user-123',
    };

    const mockToken = createMockToken(mockClaims);
    const getAccessTokenSilently = jest
      .fn()
      .mockImplementation(() =>
        Promise.resolve(mockToken)
      ) as () => Promise<string>;
    const loginWithRedirect = jest
      .fn()
      .mockImplementation(() => Promise.resolve()) as () => Promise<void>;
    const logout = jest
      .fn()
      .mockImplementation(() => Promise.resolve()) as () => Promise<void>;

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

    const { result } = renderHook(() => useAuthContext(), { wrapper: Wrapper });

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current).toEqual(
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
