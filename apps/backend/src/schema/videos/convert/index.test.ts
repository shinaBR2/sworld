import { describe, expect, it } from 'vitest';
import { convertHandlerSchema, transformEvent, videoDataSchema } from './index';

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

  it('accepts optional customRequestHeaders (A1)', () => {
    const result = convertHandlerSchema.safeParse({
      body: {
        data: { ...validData, customRequestHeaders: { Referer: 'https://x/' } },
        metadata: validMetadata,
      },
      headers: validHeaders,
    });
    expect(result.success).toBe(true);
  });
});

// ─── A1: metadata.customRequestHeaders ───────────────────────────────────────

const ID = '550e8400-e29b-41d4-a716-446655440000';
const USER_ID = '550e8400-e29b-41d4-a716-446655440001';
const VIDEO_URL = 'https://example.com/video.m3u8';

const baseData = {
  id: ID,
  user_id: USER_ID,
  video_url: VIDEO_URL,
  skip_process: false,
  keep_original_source: false,
};

const eventWith = (data: Record<string, unknown>) =>
  ({
    metadata: { id: 'evt-1', span_id: 'span-1', trace_id: 'trace-1' },
    data,
  }) as unknown as Parameters<typeof transformEvent>[0];

describe('transformEvent', () => {
  it('leaves customRequestHeaders undefined when metadata is absent', () => {
    const result = transformEvent(eventWith(baseData));

    expect(result.data.customRequestHeaders).toBeUndefined();
    expect(result.data.videoUrl).toBe(VIDEO_URL);
    expect(result.data.fileType).toBe('hls');
  });

  it('surfaces customRequestHeaders from metadata', () => {
    const result = transformEvent(
      eventWith({
        ...baseData,
        metadata: {
          customRequestHeaders: { Referer: 'https://phimnhua.online/' },
        },
      }),
    );

    expect(result.data.customRequestHeaders).toEqual({
      Referer: 'https://phimnhua.online/',
    });
  });
});

describe('videoDataSchema metadata', () => {
  it('parses a row with metadata (customRequestHeaders + passthrough lastError)', () => {
    const parsed = videoDataSchema.parse({
      ...baseData,
      metadata: {
        customRequestHeaders: { Referer: 'https://x/' },
        lastError: { code: 'CLIENT_ERROR' },
      },
    });

    expect(parsed.metadata?.customRequestHeaders).toEqual({
      Referer: 'https://x/',
    });
  });

  it('parses a row with no metadata (backwards compatible)', () => {
    const parsed = videoDataSchema.parse(baseData);
    expect(parsed.metadata).toBeUndefined();
  });
});
