import { describe, expect, it } from 'vitest';
import { shareSchema } from './index';

describe('shareSchema', () => {
  const validPayload = {
    body: {
      event: {
        metadata: {
          id: 'event-123',
          span_id: 'span-123',
          trace_id: 'trace-123',
        },
        data: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          shared_recipients_input: ['user1@example.com', 'user2@example.com'],
        },
      },
    },
    headers: {
      'content-type': 'application/json',
      'x-webhook-signature': 'signature-123',
    },
  };

  it('should validate a correct payload', () => {
    const result = shareSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  describe('metadata validation', () => {
    it('should reject missing metadata fields', () => {
      const invalidPayload = {
        ...validPayload,
        body: {
          ...validPayload.body,
          event: {
            ...validPayload.body.event,
            metadata: {
              id: 'event-123',
              // Missing span_id and trace_id
            },
          },
        },
      };
      const result = shareSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });
  });

  describe('data validation', () => {
    it('should reject non-UUID playlist id', () => {
      const invalidPayload = {
        ...validPayload,
        body: {
          ...validPayload.body,
          event: {
            ...validPayload.body.event,
            data: {
              ...validPayload.body.event.data,
              id: 'not-a-uuid',
            },
          },
        },
      };
      const result = shareSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });

    it('should reject invalid email in shared_recipients_input', () => {
      const invalidPayload = {
        ...validPayload,
        body: {
          ...validPayload.body,
          event: {
            ...validPayload.body.event,
            data: {
              ...validPayload.body.event.data,
              shared_recipients_input: ['not-an-email', 'user@example.com'],
            },
          },
        },
      };
      const result = shareSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });

    it('should reject empty shared_recipients_input array', () => {
      const invalidPayload = {
        ...validPayload,
        body: {
          ...validPayload.body,
          event: {
            ...validPayload.body.event,
            data: {
              ...validPayload.body.event.data,
              shared_recipients_input: [],
            },
          },
        },
      };
      const result = shareSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });
  });

  describe('headers validation', () => {
    it('should require content-type and signature headers', () => {
      const invalidPayload = {
        ...validPayload,
        headers: {},
      };
      const result = shareSchema.safeParse(invalidPayload);
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
      const result = shareSchema.safeParse(payloadWithExtraHeaders);
      expect(result.success).toBe(true);
    });
  });

  it('should transform payload correctly', () => {
    const result = shareSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({
        event: {
          data: {
            id: '550e8400-e29b-41d4-a716-446655440000',
            sharedRecipientsInput: ['user1@example.com', 'user2@example.com'],
          },
          metadata: {
            id: 'event-123',
            spanId: 'span-123',
            traceId: 'trace-123',
          },
        },
        contentTypeHeader: 'application/json',
        signatureHeader: 'signature-123',
      });
    }
  });
});
