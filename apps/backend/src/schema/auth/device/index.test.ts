import { describe, expect, it } from 'vitest';
import { deviceRequestCreateSchema } from './index';

// Example valid payload
const validPayload = {
  body: {
    action: {
      name: 'pair_device',
    },
    input: {
      input: {
        extensionId: 'ext-123',
      },
    },
  },
  headers: {
    'content-type': 'application/json',
    'x-hasura-action': 'createDeviceRequest',
  },
  ip: '192.168.1.1',
  userAgent: 'Test User Agent',
};

describe('deviceRequestCreateSchema', () => {
  it('should validate a correct payload', () => {
    const result = deviceRequestCreateSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it('should transform the payload correctly', () => {
    const result = deviceRequestCreateSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toMatchObject({
        action: validPayload.body.action,
        input: validPayload.body.input,
        extensionId: validPayload.body.input.input.extensionId,
        hasuraActionHeader: validPayload.headers['x-hasura-action'],
        contentTypeHeader: validPayload.headers['content-type'],
        ip: validPayload.ip,
        userAgent: validPayload.userAgent,
      });
    }
  });

  describe('body validation', () => {
    it('should reject missing action', () => {
      const invalidPayload = {
        ...validPayload,
        body: {
          ...validPayload.body,
          action: undefined,
        },
      };
      const result = deviceRequestCreateSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });

    it('should reject missing input.input', () => {
      const invalidPayload = {
        ...validPayload,
        body: {
          ...validPayload.body,
          input: {},
        },
      };
      const result = deviceRequestCreateSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });

    it('should reject missing extensionId in input.input', () => {
      const invalidPayload = {
        ...validPayload,
        body: {
          ...validPayload.body,
          input: {
            input: {}, // missing extensionId
          },
        },
      };
      const result = deviceRequestCreateSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });
  });

  describe('ip and userAgent validation', () => {
    it('should require ip field', () => {
      const invalidPayload = {
        ...validPayload,
        ip: undefined,
      };
      const result = deviceRequestCreateSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });

    it('should make userAgent optional', () => {
      const payload = {
        ...validPayload,
        userAgent: undefined,
      };
      const result = deviceRequestCreateSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });
  });

  describe('headers validation', () => {
    it('should require content-type and x-hasura-action headers', () => {
      const invalidPayload = {
        ...validPayload,
        headers: {},
      };
      const result = deviceRequestCreateSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });

    it('should reject missing x-hasura-action header', () => {
      const invalidPayload = {
        ...validPayload,
        headers: {
          'content-type': 'application/json',
        },
      };
      const result = deviceRequestCreateSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });

    it('should allow additional headers', () => {
      const payloadWithExtraHeaders = {
        ...validPayload,
        headers: {
          ...validPayload.headers,
          'x-extra-header': 'some-value',
        },
      };
      const result = deviceRequestCreateSchema.safeParse(
        payloadWithExtraHeaders,
      );
      expect(result.success).toBe(true);
    });
  });
});
