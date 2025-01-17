import { describe, it, expect } from 'vitest';
import { getClaims, transformUser } from './helpers';
import { User } from '@auth0/auth0-react';

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
});
