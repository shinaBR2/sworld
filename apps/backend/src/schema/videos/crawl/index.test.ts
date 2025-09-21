import { beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import {
  CrawlEventSchema,
  CrawlRequestSchema,
  crawlHandlerSchema,
  crawlSchema,
} from './index';
import { transformEventMetadata, transformHeaders } from 'src/schema/hasura';

vi.mock('src/utils/cloud-task/schema', () => ({
  taskHandlerHeaderSchema: z.object({
    'x-task-id': z.string(),
    'x-task-attempt': z.string(),
    'content-type': z.string(),
  }),
}));

vi.mock('src/schema/hasura', () => ({
  hasuraEventMetadataSchema: z.object({
    id: z.string(),
    span_id: z.string(),
    trace_id: z.string(),
  }),
  hasuraHeadersSchema: z.object({
    'x-request-id': z.string(),
    'x-hasura-user-id': z.string().optional(),
  }),
  transformEventMetadata: vi.fn((metadata) => ({
    id: metadata.id,
    spanId: metadata.span_id,
    traceId: metadata.trace_id,
  })),
  transformHeaders: vi.fn((req) => ({
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
    expect(() =>
      CrawlRequestSchema.parse(validRequestWithoutSlugPrefix),
    ).not.toThrow();
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
    const result = crawlSchema.parse(validRequest);

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
    const result = crawlSchema.parse(requestWithMissingOptionals);

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
    crawlSchema.parse(validRequest);

    // Assert
    expect(transformEventMetadata).toHaveBeenCalledWith(
      validRequest.body.event.metadata,
    );
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
    expect(() => crawlSchema.parse(invalidRequest)).toThrow();
  });
});

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
