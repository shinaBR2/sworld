import { describe, expect, it } from 'vitest';
import { StreamHandlerSchema } from './schema';

describe('StreamHandlerSchema', () => {
  // Common test data
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
    keepOriginalSource: false,
  };

  // Helper function to create test request
  const createRequest = ({ data = validData, metadata = validMetadata, headers = validHeaders } = {}) => ({
    body: { data, metadata },
    headers,
  });

  describe('headers validation', () => {
    it('should reject request with missing x-task-id headers', () => {
      const { 'x-task-id': _, ...headersWithoutTaskId } = validHeaders;
      // @ts-expect-error
      const result = StreamHandlerSchema.safeParse(createRequest({ headers: headersWithoutTaskId }));
      expect(result.success).toBe(false);
    });

    it('should reject request with missing content-type headers', () => {
      const { 'content-type': _, ...headersWithoutContentType } = validHeaders;
      // @ts-expect-error
      const result = StreamHandlerSchema.safeParse(createRequest({ headers: headersWithoutContentType }));
      expect(result.success).toBe(false);
    });
  });

  describe('data validation', () => {
    it('should reject request with missing required fields', () => {
      const { id: _, ...dataWithoutId } = validData;
      // @ts-expect-error
      const result = StreamHandlerSchema.safeParse(createRequest({ data: dataWithoutId }));
      expect(result.success).toBe(false);
    });

    it('should reject empty string values', () => {
      const result = StreamHandlerSchema.safeParse(createRequest({ data: { ...validData, id: '' } }));
      expect(result.success).toBe(false);
    });

    it('should reject non-UUID id', () => {
      const result = StreamHandlerSchema.safeParse(createRequest({ data: { ...validData, id: 'invalid-id' } }));
      expect(result.success).toBe(false);
    });
  });

  describe('URL validation', () => {
    it('should reject non-HTTPS video URL', () => {
      const result = StreamHandlerSchema.safeParse(
        createRequest({
          data: { ...validData, videoUrl: 'http://storage.example.com/video.mp4' },
        })
      );
      expect(result.success).toBe(false);
    });

    it('should reject non-video file URL', () => {
      const result = StreamHandlerSchema.safeParse(
        createRequest({
          data: { ...validData, videoUrl: 'https://storage.example.com/image.jpg' },
        })
      );
      expect(result.success).toBe(false);
    });
  });

  it('should validate correct request structure', () => {
    const validRequest = createRequest();
    const result = StreamHandlerSchema.safeParse(validRequest);
    expect(result.success).toBe(true);
  });
});
