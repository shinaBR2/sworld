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
  });

  it('should create a GraphQLClient with correct parameters', async () => {
    // Import the client after mocks are set up
    const { hasuraClient } = await import('./client');

    // Verify GraphQLClient constructor was called correctly
    expect(GraphQLClient).toHaveBeenCalledWith('https://test-hasura-endpoint.com', {
      headers: {
        'x-hasura-admin-secret': 'test-admin-secret',
      },
    });
  });

  it('should handle missing environment variables', async () => {
    // Save original values
    const originalEndpoint = vi.mocked(envConfig).hasuraEndpoint;
    const originalSecret = vi.mocked(envConfig).hasuraAdminSecret;

    // Test missing endpoint
    vi.mocked(envConfig).hasuraEndpoint = undefined;
    vi.resetModules();

    await expect(async () => {
      await import('./client');
    }).rejects.toThrow(/endpoint/i);

    // Restore endpoint, test missing secret
    vi.mocked(envConfig).hasuraEndpoint = originalEndpoint;
    vi.mocked(envConfig).hasuraAdminSecret = undefined;
    vi.resetModules();

    await expect(async () => {
      await import('./client');
    }).rejects.toThrow(/admin secret/i);

    // Restore original values
    vi.mocked(envConfig).hasuraAdminSecret = originalSecret;
  });
});
