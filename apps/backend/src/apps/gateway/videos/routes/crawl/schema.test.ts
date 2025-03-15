import { beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { transformEventMetadata, transformHeaders } from '../../schema';
import { CrawlEventSchema, CrawlRequestSchema, CrawlSchema } from './schema'; // Update with actual path

// Mock the imported schemas and transform functions
vi.mock('../../schema', () => ({
  hasuraEventMetadataSchema: z.object({
    id: z.string(),
    span_id: z.string(),
    trace_id: z.string(),
  }),
  headersSchema: z.object({
    'x-request-id': z.string(),
    'x-hasura-user-id': z.string().optional(),
  }),
  transformEventMetadata: vi.fn(metadata => ({
    id: metadata.id,
    spanId: metadata.span_id,
    traceId: metadata.trace_id,
  })),
  transformHeaders: vi.fn(req => ({
    requestId: req.headers['x-request-id'],
    userId: req.headers['x-hasura-user-id'],
  })),
}));

describe('CrawlRequestSchema', () => {
  it('should validate a valid request', () => {
    // Arrange
    const validRequest = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      user_id: '123e4567-e89b-12d3-a456-426614174001',
      url: 'https://example.com/video',
      get_single_video: true,
      title: 'Example Video',
      slug_prefix: 'example',
    };

    // Act & Assert
    expect(() => CrawlRequestSchema.parse(validRequest)).not.toThrow();
    const result = CrawlRequestSchema.parse(validRequest);
    expect(result).toEqual(validRequest);
  });

  it('should reject invalid request with proper error messages', () => {
    // Arrange
    const invalidRequest = {
      id: 'not-a-uuid',
      user_id: '123e4567-e89b-12d3-a456-426614174001',
      url: 'not-a-url',
      get_single_video: 'not-a-boolean', // Wrong type
      title: '',
      slug_prefix: 123, // Wrong type
    };

    // Act & Assert
    const result = CrawlRequestSchema.safeParse(invalidRequest);
    expect(result.success).toBe(false);

    if (!result.success) {
      const errors = result.error.format();
      expect(errors.id?._errors).toBeDefined();
      expect(errors.url?._errors).toBeDefined();
      expect(errors.get_single_video?._errors).toBeDefined();
      expect(errors.title?._errors).toBeDefined();
      expect(errors.slug_prefix?._errors).toBeDefined();
    }
  });

  it('should make slug_prefix optional', () => {
    // Arrange
    const validRequestWithoutSlugPrefix = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      user_id: '123e4567-e89b-12d3-a456-426614174001',
      url: 'https://example.com/video',
      get_single_video: true,
      title: 'Example Video',
      // No slug_prefix
    };

    // Act & Assert
    expect(() => CrawlRequestSchema.parse(validRequestWithoutSlugPrefix)).not.toThrow();
  });
});

describe('CrawlEventSchema', () => {
  it('should validate a valid event', () => {
    // Arrange
    const validEvent = {
      metadata: {
        id: 'event-123',
        span_id: 'span-456',
        trace_id: 'trace-789',
      },
      data: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        user_id: '123e4567-e89b-12d3-a456-426614174001',
        url: 'https://example.com/video',
        get_single_video: true,
        title: 'Example Video',
        slug_prefix: 'example',
      },
    };

    // Act & Assert
    expect(() => CrawlEventSchema.parse(validEvent)).not.toThrow();
  });

  it('should reject invalid event', () => {
    // Arrange
    const invalidEvent = {
      metadata: {
        // Missing required fields
      },
      data: {
        // Invalid data
        id: 'not-uuid',
      },
    };

    // Act & Assert
    const result = CrawlEventSchema.safeParse(invalidEvent);
    expect(result.success).toBe(false);
  });
});

describe('CrawlSchema', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should validate and transform a valid request', () => {
    // Arrange
    const validRequest = {
      body: {
        event: {
          metadata: {
            id: 'event-123',
            span_id: 'span-456',
            trace_id: 'trace-789',
          },
          data: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            user_id: '123e4567-e89b-12d3-a456-426614174001',
            url: 'https://example.com/video',
            get_single_video: true,
            title: 'Example Video',
            slug_prefix: 'example',
          },
        },
      },
      headers: {
        'x-request-id': 'req-123',
        'x-hasura-user-id': 'user-456',
      },
    };

    // Act
    const result = CrawlSchema.parse(validRequest);

    // Assert
    expect(result).toEqual({
      requestId: 'req-123',
      userId: 'user-456',
      event: {
        data: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          userId: '123e4567-e89b-12d3-a456-426614174001',
          url: 'https://example.com/video',
          getSingleVideo: true,
          title: 'Example Video',
          slugPrefix: 'example',
        },
        metadata: {
          id: 'event-123',
          spanId: 'span-456',
          traceId: 'trace-789',
        },
      },
    });
  });

  it('should handle missing optional fields', () => {
    // Arrange
    const requestWithMissingOptionals = {
      body: {
        event: {
          metadata: {
            id: 'event-123',
            span_id: 'span-456',
            trace_id: 'trace-789',
          },
          data: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            user_id: '123e4567-e89b-12d3-a456-426614174001',
            url: 'https://example.com/video',
            get_single_video: true,
            title: 'Example Video',
            // Missing slug_prefix
          },
        },
      },
      headers: {
        'x-request-id': 'req-123',
        // Missing x-hasura-user-id
      },
    };

    // Act
    const result = CrawlSchema.parse(requestWithMissingOptionals);

    // Assert
    expect(result.event.data.slugPrefix).toBeUndefined();
    expect(result.userId).toBeUndefined();
  });

  it('should call the transform functions with correct parameters', () => {
    // Arrange
    const validRequest = {
      body: {
        event: {
          metadata: {
            id: 'event-123',
            span_id: 'span-456',
            trace_id: 'trace-789',
          },
          data: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            user_id: '123e4567-e89b-12d3-a456-426614174001',
            url: 'https://example.com/video',
            get_single_video: true,
            title: 'Example Video',
          },
        },
      },
      headers: {
        'x-request-id': 'req-123',
      },
    };

    // Act
    CrawlSchema.parse(validRequest);

    // Assert
    expect(transformEventMetadata).toHaveBeenCalledWith(validRequest.body.event.metadata);
    expect(transformHeaders).toHaveBeenCalledWith(validRequest);
  });

  it('should reject invalid request structure', () => {
    // Arrange
    const invalidRequest = {
      // Missing body
      headers: {
        'x-request-id': 'req-123',
      },
    };

    // Act & Assert
    expect(() => CrawlSchema.parse(invalidRequest)).toThrow();
  });
});
