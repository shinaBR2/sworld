import { describe, expect, it } from 'vitest';
import { hashnodeWebhookSchema } from './hashnode';

describe('hashnodeWebhookSchema', () => {
  const validRequest = {
    headers: {
      'content-type': 'application/json',
      'x-hashnode-signature': 'test-signature',
      'some-other-header': 'value',
    },
    body: {
      metadata: {
        uuid: '8ebc1c40-4689-4896-a3fa-e98974d9c64a',
      },
      data: {
        publication: { id: '6045fecf8458d42fc821d079' },
        post: { id: '67e0ae5addd1bbc4e0f63015' },
        eventType: 'post_published',
      },
    },
  };

  it('should validate valid request with different event types', () => {
    const eventTypes = [
      'post_published',
      'post_updated',
      'post_deleted',
    ] as const;

    eventTypes.forEach((eventType) => {
      const request = {
        ...validRequest,
        body: {
          ...validRequest.body,
          data: {
            ...validRequest.body.data,
            eventType,
          },
        },
      };

      const result = hashnodeWebhookSchema.parse(request);
      expect(result.body.data.eventType).toBe(eventType);
    });
  });

  it('should fail with invalid event type', () => {
    const invalidRequest = {
      ...validRequest,
      body: {
        ...validRequest.body,
        data: {
          ...validRequest.body.data,
          eventType: 'unknown_event',
        },
      },
    };
    expect(() => hashnodeWebhookSchema.parse(invalidRequest)).toThrow();
  });

  it('should fail when content-type is not application/json', () => {
    const invalidRequest = {
      ...validRequest,
      headers: { ...validRequest.headers, 'content-type': 'text/plain' },
    };
    expect(() => hashnodeWebhookSchema.parse(invalidRequest)).toThrow();
  });

  it('should fail when signature is missing', () => {
    const invalidRequest = {
      ...validRequest,
      headers: { 'content-type': 'application/json' },
    };
    expect(() => hashnodeWebhookSchema.parse(invalidRequest)).toThrow();
  });

  it('should fail with invalid UUID', () => {
    const invalidRequest = {
      ...validRequest,
      body: {
        ...validRequest.body,
        metadata: { uuid: 'not-a-uuid' },
      },
    };
    expect(() => hashnodeWebhookSchema.parse(invalidRequest)).toThrow();
  });

  it('should fail when required body fields are missing', () => {
    const invalidRequest = {
      ...validRequest,
      body: {},
    };
    expect(() => hashnodeWebhookSchema.parse(invalidRequest)).toThrow();
  });
});
