import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { crawlHandlerSchema } from './schema';

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

  const validMetadata = {
    id: 'test-id',
    spanId: 'test-span-id',
    traceId: 'test-trace-id',
  };

  const validBody = {
    data: {
      getSingleVideo: true,
      url: 'https://example.com/video',
      title: 'Test Video Title',
      userId: '123e4567-e89b-12d3-a456-426614174000',
    },
    metadata: validMetadata,
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
    expect(result.body.data.slugPrefix).toBe('');
  });

  it('should accept custom slugPrefix when provided', () => {
    const input = {
      headers: validHeaders,
      body: {
        ...validBody,
        data: {
          ...validBody.data,
          slugPrefix: 'custom-prefix-',
        },
      },
    };

    const result = crawlHandlerSchema.parse(input);
    expect(result.body.data.slugPrefix).toBe('custom-prefix-');
  });

  it('should reject invalid URLs', () => {
    const input = {
      headers: validHeaders,
      body: {
        ...validBody,
        data: {
          ...validBody.data,
          url: 'invalid-url',
        },
      },
    };

    expect(() => crawlHandlerSchema.parse(input)).toThrow();
  });

  it('should reject empty titles', () => {
    const input = {
      headers: validHeaders,
      body: {
        ...validBody,
        data: {
          ...validBody.data,
          title: '',
        },
      },
    };

    expect(() => crawlHandlerSchema.parse(input)).toThrow();
  });

  it('should reject invalid UUID for userId', () => {
    const input = {
      headers: validHeaders,
      body: {
        ...validBody,
        data: {
          ...validBody.data,
          userId: 'not-a-uuid',
        },
      },
    };

    expect(() => crawlHandlerSchema.parse(input)).toThrow();
  });

  it('should reject when getSingleVideo is not a boolean', () => {
    const input = {
      headers: validHeaders,
      body: {
        ...validBody,
        data: {
          ...validBody.data,
          getSingleVideo: 'yes' as any,
        },
      },
    };

    expect(() => crawlHandlerSchema.parse(input)).toThrow();
  });

  it('should reject when required fields are missing', () => {
    const { getSingleVideo, ...bodyWithoutGetSingleVideo } = validBody.data;
    const input = {
      headers: validHeaders,
      body: {
        ...validBody,
        data: bodyWithoutGetSingleVideo,
      },
    };

    expect(() => crawlHandlerSchema.parse(input)).toThrow();
  });

  it('should reject when metadata is missing', () => {
    const { metadata, ...bodyWithoutMetadata } = validBody;
    const input = {
      headers: validHeaders,
      body: bodyWithoutMetadata,
    };

    expect(() => crawlHandlerSchema.parse(input)).toThrow();
  });
});
