import { describe, it, expect } from 'vitest';
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
    ];

    expectedKeys.forEach(key => {
      expect(envConfig).toHaveProperty(key);
    });
  });
});
