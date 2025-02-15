import { describe, it, expect } from 'vitest';
import { FixDurationHandlerSchema } from './schema';

describe('FixDurationHandlerSchema', () => {
  const validRequest = {
    body: {
      id: '123e4567-e89b-12d3-a456-426614174000',
    },
    headers: {
      'some-header': 'value',
      'content-type': 'application/json',
      'x-task-id': '223e4567-e89b-12d3-a456-426614174001',
    },
  };

  it('should validate valid request', () => {
    const result = FixDurationHandlerSchema.parse(validRequest);
    expect(result).toEqual(validRequest);
  });

  it('should fail when body is missing', () => {
    const requestWithoutBody = {
      headers: validRequest.headers,
    };

    expect(() => FixDurationHandlerSchema.parse(requestWithoutBody)).toThrow();
  });

  it('should fail when id is missing', () => {
    const requestWithoutId = {
      ...validRequest,
      body: {},
    };

    expect(() => FixDurationHandlerSchema.parse(requestWithoutId)).toThrow();
  });

  it('should fail when headers are missing', () => {
    const requestWithoutHeaders = {
      body: validRequest.body,
    };

    expect(() => FixDurationHandlerSchema.parse(requestWithoutHeaders)).toThrow();
  });
});
