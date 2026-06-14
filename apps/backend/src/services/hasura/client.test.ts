import { GraphQLClient } from 'graphql-request';
import { envConfig } from 'src/utils/envConfig';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock dependencies
vi.mock('graphql-request', () => ({
  GraphQLClient: vi.fn().mockImplementation(() => ({
    request: vi.fn(),
  })),
}));

vi.mock('src/utils/envConfig', () => ({
  envConfig: {
    hasuraEndpoint: 'https://test-hasura-endpoint.com',
    hasuraAdminSecret: 'test-admin-secret',
  },
}));

describe('hasuraClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    // Restore the default mocked env before each test
    vi.mocked(envConfig).hasuraEndpoint = 'https://test-hasura-endpoint.com';
    vi.mocked(envConfig).hasuraAdminSecret = 'test-admin-secret';
  });

  it('does not construct the client at import time', async () => {
    await import('./client');

    // Lazy: importing the module must not touch the env or build the client.
    expect(GraphQLClient).not.toHaveBeenCalled();
  });

  it('constructs a GraphQLClient with correct parameters on first use', async () => {
    const { hasuraClient } = await import('./client');

    // Accessing a member triggers lazy construction.
    void hasuraClient.request;

    expect(GraphQLClient).toHaveBeenCalledWith(
      'https://test-hasura-endpoint.com',
      {
        headers: {
          'x-hasura-admin-secret': 'test-admin-secret',
        },
      },
    );
  });

  it('throws on use when the endpoint is missing', async () => {
    vi.mocked(envConfig).hasuraEndpoint = undefined;
    const { hasuraClient } = await import('./client');

    expect(() => hasuraClient.request).toThrow(/endpoint/i);
  });

  it('throws on use when the admin secret is missing', async () => {
    vi.mocked(envConfig).hasuraAdminSecret = undefined;
    const { hasuraClient } = await import('./client');

    expect(() => hasuraClient.request).toThrow(/admin secret/i);
  });
});
