import { describe, it, expect } from 'vitest';
import { ConvertSchema } from './schema';

describe('ConvertSchema', () => {
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
        },
      },
    },
    headers: {
      'content-type': 'application/json',
      'x-webhook-signature': 'signature-123',
    },
  };

  it('should validate a correct payload', () => {
    const result = ConvertSchema.safeParse(validPayload);
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
      const result = ConvertSchema.safeParse(invalidPayload);
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
      const result = ConvertSchema.safeParse(invalidPayload);
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
      const result = ConvertSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });
  });

  describe('headers validation', () => {
    it('should require content-type and signature headers', () => {
      const invalidPayload = {
        ...validPayload,
        headers: {},
      };
      const result = ConvertSchema.safeParse(invalidPayload);
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
      const result = ConvertSchema.safeParse(payloadWithExtraHeaders);
      expect(result.success).toBe(true);
    });
  });

  it('should transform payload correctly', () => {
    const result = ConvertSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({
        event: {
          data: {
            id: '550e8400-e29b-41d4-a716-446655440000',
            userId: '550e8400-e29b-41d4-a716-446655440001',
            videoUrl: 'https://example.com/video.mp4',
            fileType: 'video',
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
    const result = ConvertSchema.safeParse(invalidPayload);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some(
          issue => issue.path.includes('id') || issue.path.includes('user_id')
        )
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
    const result = ConvertSchema.safeParse(youtubePayload);
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
    const result = ConvertSchema.safeParse(hlsPayload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.event.data).toMatchObject({
        fileType: 'hls',
        platform: null,
      });
    }
  });
});
