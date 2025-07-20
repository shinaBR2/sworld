import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getClaims, transformUser, notifyExtensionTokenChange } from './helpers';
import { User } from '@auth0/auth0-react';

// Define Chrome extension types
declare global {
  interface Window {
    chrome?: {
      runtime?: {
        sendMessage?: (extensionId: string, message: any, responseCallback?: (response: any) => void) => void;
        lastError?: { message: string } | null;
      };
    };
  }
}

// Setup and teardown for chrome mock
beforeEach(() => {
  // Reset window.chrome before each test
  delete (global.window as any).chrome;
  vi.clearAllMocks();
});

afterEach(() => {
  delete (global.window as any).chrome;
});

describe('getClaims', () => {
  it('should extract Hasura claims from a valid JWT token', () => {
    // Create a mock JWT token with Hasura claims
    const claims = {
      'x-hasura-default-role': 'user',
      'x-hasura-allowed-roles': ['user', 'admin'],
      'x-hasura-user-id': '123',
    };

    const mockPayload = {
      'https://hasura.io/jwt/claims': claims,
    };

    const token = `header.${btoa(JSON.stringify(mockPayload))}.signature`;

    const result = getClaims(token);
    expect(result).toEqual(claims);
  });

  it('should return null for invalid JWT token', () => {
    const result = getClaims('invalid.token.format');
    expect(result).toBeNull();
  });

  it('should return null when token has no Hasura claims', () => {
    const mockPayload = {
      sub: '123',
      email: 'test@example.com',
    };

    const token = `header.${btoa(JSON.stringify(mockPayload))}.signature`;

    const result = getClaims(token);
    expect(result).toBeNull();
  });
});

describe('transformUser', () => {
  it('should transform valid Auth0 user to CustomUser', () => {
    const auth0User: User = {
      sub: 'auth0|123',
      email: 'test@example.com',
      name: 'Test User',
      picture: 'https://example.com/pic.jpg',
      email_verified: true,
      updated_at: '2024-01-17',
    };

    const result = transformUser('123', auth0User);

    expect(result).toEqual({
      id: '123',
      email: 'test@example.com',
      name: 'Test User',
      picture: 'https://example.com/pic.jpg',
    });
  });

  it('should return null when id is missing', () => {
    const auth0User: User = {
      sub: 'auth0|123',
      email: 'test@example.com',
      name: 'Test User',
      picture: 'https://example.com/pic.jpg',
      email_verified: true,
      updated_at: '2024-01-17',
    };

    const result = transformUser('', auth0User);
    expect(result).toBeNull();
  });

  it('should return null when auth0User is undefined', () => {
    const result = transformUser('123', undefined);
    expect(result).toBeNull();
  });

  it('should return null when auth0User.sub is missing', () => {
    const auth0User: User = {
      sub: '', // Empty sub
      email: 'test@example.com',
      name: 'Test User',
      picture: 'https://example.com/pic.jpg',
      email_verified: true,
      updated_at: '2024-01-17',
    };

    const result = transformUser('123', auth0User);
    expect(result).toBeNull();
  });

  it('should handle partial user data', () => {
    const auth0User: Partial<User> = {
      sub: 'auth0|123',
      name: 'Test User',
      // Missing email and picture
    };

    const result = transformUser('123', auth0User as User);
    expect(result).toEqual({
      id: '123',
      email: undefined,
      name: 'Test User',
      picture: undefined,
    });
  });
});

describe('notifyExtensionTokenChange', () => {
  it('should send message to extension when chrome.runtime is available', () => {
    const testToken = 'test-token';
    const sendMessageMock = vi.fn((_id, _message, callback) => {
      // Simulate successful message send
      if (callback) callback({ success: true });
    });

    // Setup mock implementation
    (global.window as any).chrome = {
      runtime: {
        sendMessage: sendMessageMock,
        lastError: null,
      },
    };

    notifyExtensionTokenChange(testToken);

    expect(sendMessageMock).toHaveBeenCalledWith(
      'egfcglaomminlahocafmecmilaplbock',
      { type: 'AUTH_TOKEN', token: testToken },
      expect.any(Function)
    );
  });

  it('should not throw when chrome.runtime is not available', () => {
    // @ts-ignore - intentionally removing chrome for test
    delete global.window.chrome;

    expect(() => notifyExtensionTokenChange('test-token')).not.toThrow();
  });

  it('should handle errors from chrome.runtime.sendMessage', () => {
    const testToken = 'test-token';
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    // Setup mock implementation with error
    (global.window as any).chrome = {
      runtime: {
        sendMessage: vi.fn((_id, _message, callback) => {
          // Simulate error by setting lastError
          (global.window as any).chrome.runtime.lastError = { message: 'Extension not found' };
          if (callback) callback();
        }),
        lastError: null,
      },
    };

    notifyExtensionTokenChange(testToken);

    // Wait for any async operations
    return new Promise<void>(resolve => {
      setTimeout(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Extension not available');
        consoleSpy.mockRestore();
        resolve();
      }, 0);
    });
  });
});
