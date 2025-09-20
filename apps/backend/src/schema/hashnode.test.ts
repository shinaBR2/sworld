import { describe, expect, it } from 'vitest';
import { hashnodeHeadersSchema, hashnodeBodySchema } from './hashnode';

describe('hashnodeWebhookSchema', () => {
  const validHeaders = {
    'content-type': 'application/json',
    'x-hashnode-signature': 'test-signature',
  };

  const validBody = {
    metadata: {
      uuid: '8ebc1c40-4689-4896-a3fa-e98974d9c64a',
    },
    data: {
      publication: { id: '6045fecf8458d42fc821d079' },
      post: { id: '67e0ae5addd1bbc4e0f63015' },
      eventType: 'post_published',
    },
  };

  describe('hashnodeHeadersSchema', () => {
    it('should validate valid headers', () => {
      const result = hashnodeHeadersSchema.safeParse(validHeaders);
      expect(result.success).toBe(true);
    });

    it('should fail without content-type header', () => {
      const invalidHeaders = { ...validHeaders };
      delete invalidHeaders['content-type'];
      const result = hashnodeHeadersSchema.safeParse(invalidHeaders);
      expect(result.success).toBe(false);
    });

    it('should fail with invalid content-type', () => {
      const result = hashnodeHeadersSchema.safeParse({
        ...validHeaders,
        'content-type': 'text/plain',
      });
      expect(result.success).toBe(false);
    });

    it('should fail without x-hashnode-signature', () => {
      const invalidHeaders = { ...validHeaders };
      delete invalidHeaders['x-hashnode-signature'];
      const result = hashnodeHeadersSchema.safeParse(invalidHeaders);
      expect(result.success).toBe(false);
    });
  });

  describe('hashnodeBodySchema', () => {
    it('should validate valid body with different event types', () => {
      const eventTypes = [
        'post_published',
        'post_updated',
        'post_deleted',
      ] as const;

      eventTypes.forEach((eventType) => {
        const body = {
          ...validBody,
          data: {
            ...validBody.data,
            eventType,
          },
        };

        const result = hashnodeBodySchema.safeParse(body);
        expect(result.success).toBe(true);
      });
    });

    it('should fail with invalid event type', () => {
      const invalidBody = {
        ...validBody,
        data: {
          ...validBody.data,
          eventType: 'invalid_event',
        },
      };
      const result = hashnodeBodySchema.safeParse(invalidBody);
      expect(result.success).toBe(false);
    });

    it('should fail with invalid UUID', () => {
      const invalidBody = {
        ...validBody,
        metadata: { uuid: 'not-a-uuid' },
      };
      const result = hashnodeBodySchema.safeParse(invalidBody);
      expect(result.success).toBe(false);
    });

    it('should fail when required fields are missing', () => {
      const invalidBodies = [
        { ...validBody, metadata: undefined },
        { ...validBody, data: undefined },
        { ...validBody, metadata: { uuid: undefined } },
        { ...validBody, data: { ...validBody.data, eventType: undefined } },
      ];

      invalidBodies.forEach((body) => {
        const result = hashnodeBodySchema.safeParse(body);
        expect(result.success).toBe(false);
      });
    });
  });
});
