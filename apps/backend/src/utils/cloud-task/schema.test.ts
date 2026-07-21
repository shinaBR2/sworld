import { describe, it, expect } from 'vitest';
import { taskHandlerHeaderSchema } from './schema';

describe('taskHandlerHeaderSchema', () => {
  it('should validate valid headers', () => {
    const validHeaders = {
      'content-type': 'application/json',
      'x-task-id': '123e4567-e89b-12d3-a456-426614174000',
    };

    const result = taskHandlerHeaderSchema.safeParse(validHeaders);
    expect(result.success).toBe(true);
  });

  it('should reject when content-type is missing', () => {
    const invalidHeaders = {
      'x-task-id': '123e4567-e89b-12d3-a456-426614174000',
    };

    const result = taskHandlerHeaderSchema.safeParse(invalidHeaders);
    expect(result.success).toBe(false);
  });

  it('should reject when x-task-id is missing', () => {
    const invalidHeaders = {
      'content-type': 'application/json',
    };

    const result = taskHandlerHeaderSchema.safeParse(invalidHeaders);
    expect(result.success).toBe(false);
  });

  it('should reject invalid UUID for x-task-id', () => {
    const invalidHeaders = {
      'content-type': 'application/json',
      'x-task-id': 'not-a-uuid',
    };

    const result = taskHandlerHeaderSchema.safeParse(invalidHeaders);
    expect(result.success).toBe(false);
  });

  it('should reject when using wrong header casing', () => {
    const invalidHeaders = {
      'Content-Type': 'application/json',
      'X-Task-ID': '123e4567-e89b-12d3-a456-426614174000',
    };

    const result = taskHandlerHeaderSchema.safeParse(invalidHeaders);
    expect(result.success).toBe(false);
  });

  it('should reject empty string values', () => {
    const invalidHeaders = {
      'content-type': '',
      'x-task-id': '',
    };

    const result = taskHandlerHeaderSchema.safeParse(invalidHeaders);
    expect(result.success).toBe(false);
  });

  it('should reject non-string values', () => {
    const invalidHeaders = {
      'content-type': 123,
      'x-task-id': true,
    };

    const result = taskHandlerHeaderSchema.safeParse(invalidHeaders);
    expect(result.success).toBe(false);
  });

  it('should reject multiple values for same header', () => {
    const invalidHeaders = {
      'content-type': ['application/json', 'text/plain'],
      'x-task-id': ['123e4567-e89b-12d3-a456-426614174000'],
    };

    const result = taskHandlerHeaderSchema.safeParse(invalidHeaders);
    expect(result.success).toBe(false);
  });
});
