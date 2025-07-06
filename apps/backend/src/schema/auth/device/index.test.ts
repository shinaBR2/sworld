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
};

describe('deviceRequestCreateSchema', () => {
  it('should validate a correct payload', () => {
    const result = deviceRequestCreateSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
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
      const result = deviceRequestCreateSchema.safeParse(payloadWithExtraHeaders);
      expect(result.success).toBe(true);
    });
  });
});
