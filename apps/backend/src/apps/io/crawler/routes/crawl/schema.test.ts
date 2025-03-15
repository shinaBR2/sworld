import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { crawlHandlerSchema } from './schema'; // Adjust import path as needed

// Mock the taskHandlerHeaderSchema if needed
vi.mock('src/utils/cloud-task/schema', () => ({
  taskHandlerHeaderSchema: z.object({
    'x-task-id': z.string(),
    'x-task-attempt': z.string(),
    'content-type': z.string(),
  }),
}));

describe('crawlHandlerSchema', () => {
  const validHeaders = {
    'x-task-id': 'test-task-id',
    'x-task-attempt': '1',
    'content-type': 'application/json',
  };

  const validBody = {
    getSingleVideo: true,
    url: 'https://example.com/video',
    title: 'Test Video Title',
    userId: '123e4567-e89b-12d3-a456-426614174000',
  };

  it('should validate a valid input', () => {
    const input = {
      headers: validHeaders,
      body: validBody,
    };

    const result = crawlHandlerSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it('should set default slugPrefix when not provided', () => {
    const input = {
      headers: validHeaders,
      body: validBody,
    };

    const result = crawlHandlerSchema.parse(input);
    expect(result.body.slugPrefix).toBe('');
  });

  it('should accept custom slugPrefix when provided', () => {
    const input = {
      headers: validHeaders,
      body: {
        ...validBody,
        slugPrefix: 'custom-prefix-',
      },
    };

    const result = crawlHandlerSchema.parse(input);
    expect(result.body.slugPrefix).toBe('custom-prefix-');
  });

  it('should reject invalid URLs', () => {
    const input = {
      headers: validHeaders,
      body: {
        ...validBody,
        url: 'invalid-url',
      },
    };

    expect(() => crawlHandlerSchema.parse(input)).toThrow();
  });

  it('should reject empty titles', () => {
    const input = {
      headers: validHeaders,
      body: {
        ...validBody,
        title: '',
      },
    };

    expect(() => crawlHandlerSchema.parse(input)).toThrow();
  });

  it('should reject invalid UUID for userId', () => {
    const input = {
      headers: validHeaders,
      body: {
        ...validBody,
        userId: 'not-a-uuid',
      },
    };

    expect(() => crawlHandlerSchema.parse(input)).toThrow();
  });

  it('should reject when getSingleVideo is not a boolean', () => {
    const input = {
      headers: validHeaders,
      body: {
        ...validBody,
        getSingleVideo: 'yes' as any,
      },
    };

    expect(() => crawlHandlerSchema.parse(input)).toThrow();
  });

  it('should reject when required fields are missing', () => {
    const { getSingleVideo, ...bodyWithoutGetSingleVideo } = validBody;
    const input = {
      headers: validHeaders,
      body: bodyWithoutGetSingleVideo,
    };

    expect(() => crawlHandlerSchema.parse(input)).toThrow();
  });
});
