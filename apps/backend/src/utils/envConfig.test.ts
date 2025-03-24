import { describe, expect, it } from 'vitest';
import { envConfig } from './envConfig';

describe('envConfig', () => {
  it('has correct default location', () => {
    expect(envConfig.location).toBe('asia-southeast1');
  });

  it('contains expected configuration keys', () => {
    const expectedKeys = [
      'databaseUrl',
      'port',
      'storageBucket',
      'sentrydsn',
      'cloudinaryName',
      'cloudinaryApiKey',
      'cloudinaryApiSecret',
      'webhookSignature',
      'projectId',
      'computeServiceUrl',
      'ioServiceUrl',
      'location',
      'cloudTaskServiceAccount',
      'hasuraEndpoint',
      'hasuraAdminSecret',
      'hashnodeWebhookSecret',
      'hashnodeEndpoint',
      'hashnodePersonalToken',
    ];

    expectedKeys.forEach(key => {
      expect(envConfig).toHaveProperty(key);
    });
  });
});
