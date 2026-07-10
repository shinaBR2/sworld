import { describe, expect, it } from 'vitest';
import { authorizeDeviceSchema } from './authorize';

const validPayload = {
  body: {
    action: { name: 'authorizeDevice' },
    input: {
      input: { userCode: 'ABC-123', approved: true },
    },
  },
  headers: {
    'content-type': 'application/json',
    'x-hasura-action': 'authorizeDevice',
    'x-hasura-user-id': 'user-123',
  },
  ip: '192.168.1.1',
  userAgent: 'Test User Agent',
};

describe('authorizeDeviceSchema', () => {
  it('should validate a correct payload', () => {
    const result = authorizeDeviceSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it('should transform the payload correctly', () => {
    const result = authorizeDeviceSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toMatchObject({
        action: validPayload.body.action,
        input: validPayload.body.input,
        userCode: validPayload.body.input.input.userCode,
        approved: validPayload.body.input.input.approved,
        hasuraActionHeader: validPayload.headers['x-hasura-action'],
        hasuraUserId: validPayload.headers['x-hasura-user-id'],
        ip: validPayload.ip,
        userAgent: validPayload.userAgent,
      });
    }
  });

  it('should reject missing userCode', () => {
    const invalidPayload = {
      ...validPayload,
      body: {
        ...validPayload.body,
        input: {
          ...validPayload.body.input,
          input: { approved: true },
        },
      },
    };
    const result = authorizeDeviceSchema.safeParse(invalidPayload);
    expect(result.success).toBe(false);
  });

  it('should reject missing approved', () => {
    const invalidPayload = {
      ...validPayload,
      body: {
        ...validPayload.body,
        input: {
          ...validPayload.body.input,
          input: { userCode: 'ABC-123' },
        },
      },
    };
    const result = authorizeDeviceSchema.safeParse(invalidPayload);
    expect(result.success).toBe(false);
  });

  it('should handle missing hasuraUserId gracefully', () => {
    const payloadWithoutUserId = {
      ...validPayload,
      headers: {
        'content-type': 'application/json',
        'x-hasura-action': 'authorizeDevice',
      },
    };
    const result = authorizeDeviceSchema.safeParse(payloadWithoutUserId);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.hasuraUserId).toBeUndefined();
    }
  });
});
