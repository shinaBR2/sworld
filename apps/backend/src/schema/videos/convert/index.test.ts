import { describe, expect, it } from 'vitest';
import { convertHandlerSchema, convertSchema } from './index';

describe('convertSchema', () => {
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
          user_id: '550e8400-e29b-41d4-a716-446655440001',
          video_url: 'https://example.com/video.mp4',
          skip_process: false,
          keep_original_source: false,
        },
      },
    },
    headers: {
      'content-type': 'application/json',
      'x-webhook-signature': 'signature-123',
    },
  };

  it('should validate a correct payload', () => {
    const result = convertSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  describe('video data validation', () => {
    it('should reject invalid video URL protocol', () => {
      const invalidPayload = {
        ...validPayload,
        body: {
          ...validPayload.body,
          event: {
            ...validPayload.body.event,
            data: {
              ...validPayload.body.event.data,
              video_url: 'http://example.com/video.mp4',
            },
          },
        },
      };
      const result = convertSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });

    it('should reject non-video file extensions', () => {
      const invalidPayload = {
        ...validPayload,
        body: {
          ...validPayload.body,
          event: {
            ...validPayload.body.event,
            data: {
              ...validPayload.body.event.data,
              video_url: 'https://example.com/video.avi',
            },
          },
        },
      };
      const result = convertSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });
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
            },
          },
        },
      };
      const result = convertSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });
  });

  describe('headers validation', () => {
    it('should require content-type and signature headers', () => {
      const invalidPayload = {
        ...validPayload,
        headers: {},
      };
      const result = convertSchema.safeParse(invalidPayload);
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
      const result = convertSchema.safeParse(payloadWithExtraHeaders);
      expect(result.success).toBe(true);
    });
  });

  it('should transform payload correctly', () => {
    const result = convertSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({
        event: {
          data: {
            id: '550e8400-e29b-41d4-a716-446655440000',
            userId: '550e8400-e29b-41d4-a716-446655440001',
            videoUrl: 'https://example.com/video.mp4',
            fileType: 'video',
            skipProcess: false,
            keepOriginalSource: false,
            platform: null,
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

  it('should fail transformation for invalid data structure', () => {
    const invalidPayload = {
      ...validPayload,
      body: {
        event: {
          data: {
            id: 'not-a-uuid',
            user_id: 'not-a-uuid',
            video_url: 'https://example.com/video.mp4',
          },
          metadata: validPayload.body.event.metadata,
        },
      },
      headers: validPayload.headers,
    };
    const result = convertSchema.safeParse(invalidPayload);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some(
          (issue) =>
            issue.path.includes('id') || issue.path.includes('user_id'),
        ),
      ).toBe(true);
    }
  });

  it('should transform payload with platform correctly', () => {
    const youtubePayload = {
      ...validPayload,
      body: {
        ...validPayload.body,
        event: {
          ...validPayload.body.event,
          data: {
            ...validPayload.body.event.data,
            video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          },
        },
      },
    };
    const result = convertSchema.safeParse(youtubePayload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.event.data).toMatchObject({
        fileType: null,
        platform: 'youtube',
      });
    }
  });

  it('should transform payload with HLS fileType correctly', () => {
    const hlsPayload = {
      ...validPayload,
      body: {
        ...validPayload.body,
        event: {
          ...validPayload.body.event,
          data: {
            ...validPayload.body.event.data,
            video_url: 'https://example.com/stream.m3u8',
          },
        },
      },
    };
    const result = convertSchema.safeParse(hlsPayload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.event.data).toMatchObject({
        fileType: 'hls',
        platform: null,
      });
    }
  });
});

describe('convertHandlerSchema', () => {
  const validHeaders = {
    'content-type': 'application/json',
    'x-task-id': '223e4567-e89b-12d3-a456-426614174001',
  };

  const validMetadata = {
    id: 'event-789',
    spanId: 'span-abc',
    traceId: 'trace-def',
  };

  const validData = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    userId: '123e4567-e89b-12d3-a456-426614174001',
    videoUrl: 'https://storage.example.com/video.mp4',
  };

  const createRequest = ({
    data = validData,
    metadata = validMetadata,
    headers = validHeaders,
  } = {}) => ({
    body: { data, metadata },
    headers,
  });

  describe('headers validation', () => {
    it('should reject request with missing x-task-id headers', () => {
      const { 'x-task-id': _, ...headersWithoutTaskId } = validHeaders;
      // @ts-expect-error
      const result = convertHandlerSchema.safeParse(
        createRequest({ headers: headersWithoutTaskId }),
      );
      expect(result.success).toBe(false);
    });

    it('should reject request with missing content-type headers', () => {
      const { 'content-type': _, ...headersWithoutContentType } = validHeaders;
      // @ts-expect-error
      const result = convertHandlerSchema.safeParse(
        createRequest({ headers: headersWithoutContentType }),
      );
      expect(result.success).toBe(false);
    });
  });

  it('should reject request with missing required fields', () => {
    const { id: _, ...dataWithoutId } = validData;
    // @ts-expect-error
    const result = convertHandlerSchema.safeParse(
      createRequest({ data: dataWithoutId }),
    );
    expect(result.success).toBe(false);
  });

  it('should reject empty string values', () => {
    const result = convertHandlerSchema.safeParse(
      createRequest({ data: { ...validData, id: '' } }),
    );
    expect(result.success).toBe(false);
  });

  it('should validate correct request structure', () => {
    const validRequest = createRequest();
    const result = convertHandlerSchema.safeParse(validRequest);
    expect(result.success).toBe(true);
  });

  it('should reject non-UUID id', () => {
    const result = convertHandlerSchema.safeParse(
      createRequest({ data: { ...validData, id: 'invalid-id' } }),
    );
    expect(result.success).toBe(false);
  });

  it('should reject non-HTTPS video URL', () => {
    const result = convertHandlerSchema.safeParse(
      createRequest({
        data: {
          ...validData,
          videoUrl: 'http://storage.example.com/video.mp4',
        },
      }),
    );
    expect(result.success).toBe(false);
  });

  it('should reject non-video file URL', () => {
    const result = convertHandlerSchema.safeParse(
      createRequest({
        data: {
          ...validData,
          videoUrl: 'https://storage.example.com/image.jpg',
        },
      }),
    );
    expect(result.success).toBe(false);
  });
});
