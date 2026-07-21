import { describe, expect, it } from 'vitest';
import { notifyFailureSchema } from './index';

describe('notifyFailureSchema', () => {
  const validRequest = {
    body: {
      event: {
        metadata: {
          id: 'event-1',
          span_id: 'span-1',
          trace_id: 'trace-1',
        },
        data: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          title: 'My video',
          status: 'failed',
          metadata: {
            lastError: {
              code: 'CLIENT_ERROR',
              httpStatus: 403,
              message: 'Forbidden',
              at: '2026-06-14T00:00:00.000Z',
            },
          },
        },
      },
    },
    headers: {
      'content-type': 'application/json',
      'x-webhook-signature': 'test-signature',
    },
  };

  it('parses a valid request and transforms it', () => {
    const result = notifyFailureSchema.parse(validRequest);

    expect(result).toEqual({
      event: validRequest.body.event,
      contentTypeHeader: 'application/json',
      signatureHeader: 'test-signature',
    });
  });

  it('accepts null metadata / missing lastError', () => {
    const request = {
      ...validRequest,
      body: {
        event: {
          ...validRequest.body.event,
          data: {
            id: validRequest.body.event.data.id,
            title: 'No detail',
            status: 'failed',
            metadata: null,
          },
        },
      },
    };

    expect(() => notifyFailureSchema.parse(request)).not.toThrow();
  });

  it('omits the optional httpStatus', () => {
    const request = {
      ...validRequest,
      body: {
        event: {
          ...validRequest.body.event,
          data: {
            ...validRequest.body.event.data,
            metadata: {
              lastError: {
                code: 'UNKNOWN_ERROR',
                message: 'boom',
                at: '2026-06-14T00:00:00.000Z',
              },
            },
          },
        },
      },
    };

    expect(() => notifyFailureSchema.parse(request)).not.toThrow();
  });

  it('rejects a non-uuid id', () => {
    const request = {
      ...validRequest,
      body: {
        event: {
          ...validRequest.body.event,
          data: { ...validRequest.body.event.data, id: 'not-a-uuid' },
        },
      },
    };

    expect(() => notifyFailureSchema.parse(request)).toThrow();
  });

  it('rejects a missing signature header', () => {
    const request = {
      ...validRequest,
      headers: { 'content-type': 'application/json' },
    };

    expect(() => notifyFailureSchema.parse(request)).toThrow();
  });
});
