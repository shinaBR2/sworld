import { describe, expect, it } from 'vitest';
import { getDeviceTokenSchema } from './token';

const validPayload = {
  body: {
    action: { name: 'getDeviceToken' },
    input: {
      input: {
        deviceCode: 'test-device-code-123',
        grantType: 'urn:ietf:params:oauth:grant-type:device_code',
      },
    },
  },
  headers: {
    'content-type': 'application/json',
    'x-hasura-action': 'getDeviceToken',
  },
  ip: '192.168.1.1',
  userAgent: 'Test User Agent',
};

describe('getDeviceTokenSchema', () => {
  it('should validate a correct payload', () => {
    const result = getDeviceTokenSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it('should transform the payload correctly', () => {
    const result = getDeviceTokenSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toMatchObject({
        action: validPayload.body.action,
        input: validPayload.body.input,
        deviceCode: validPayload.body.input.input.deviceCode,
        grantType: validPayload.body.input.input.grantType,
        hasuraActionHeader: validPayload.headers['x-hasura-action'],
        ip: validPayload.ip,
        userAgent: validPayload.userAgent,
      });
    }
  });

  it('should reject missing deviceCode', () => {
    const invalidPayload = {
      ...validPayload,
      body: {
        ...validPayload.body,
        input: {
          ...validPayload.body.input,
          input: { grantType: 'urn:ietf:params:oauth:grant-type:device_code' },
        },
      },
    };
    const result = getDeviceTokenSchema.safeParse(invalidPayload);
    expect(result.success).toBe(false);
  });

  it('should reject missing grantType', () => {
    const invalidPayload = {
      ...validPayload,
      body: {
        ...validPayload.body,
        input: {
          ...validPayload.body.input,
          input: { deviceCode: 'test-device-code-123' },
        },
      },
    };
    const result = getDeviceTokenSchema.safeParse(invalidPayload);
    expect(result.success).toBe(false);
  });
});
