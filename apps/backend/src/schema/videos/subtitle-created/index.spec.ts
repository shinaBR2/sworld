import { describe, it, expect } from 'vitest';
import { subtitleDataSchema, eventSchema, subtitleCreatedSchema } from './index';

describe('Subtitle Schema', () => {
  const mockMetadata = {
    id: 'test-id',
    span_id: 'test-span-id',
    trace_id: 'test-trace-id',
  };

  const validSubtitleData = {
    id: '123e4567-e89b-12d3-a456-426614174000', // Valid UUID
    videoId: '123e4567-e89b-12d3-a456-426614174001', // Valid UUID
    userId: '123e4567-e89b-12d3-a456-426614174002', // Valid UUID
    lang: 'en',
    url: 'https://example.com/subtitle.vtt',
    isDefault: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  describe('subtitleDataSchema', () => {
    it('should validate valid subtitle data', () => {
      expect(() => subtitleDataSchema.parse(validSubtitleData)).not.toThrow();
    });

    it('should require all fields', () => {
      const { id, ...incompleteData } = validSubtitleData;
      expect(() => subtitleDataSchema.parse(incompleteData)).toThrow();
    });

    it('should validate URL format', () => {
      expect(() => subtitleDataSchema.parse({ ...validSubtitleData, url: 'invalid-url' })).toThrow();
    });

    it('should validate id as UUID', () => {
      // Test invalid UUID
      expect(() => subtitleDataSchema.parse({ ...validSubtitleData, id: 'invalid-uuid' })).toThrow('Invalid uuid');

      // Test valid UUID
      expect(() =>
        subtitleDataSchema.parse({
          ...validSubtitleData,
          id: '123e4567-e89b-12d3-a456-426614174000',
        })
      ).not.toThrow();
    });

    it('should validate videoId as UUID', () => {
      // Test invalid UUID
      expect(() => subtitleDataSchema.parse({ ...validSubtitleData, videoId: 'invalid-uuid' })).toThrow('Invalid uuid');

      // Test valid UUID
      expect(() =>
        subtitleDataSchema.parse({
          ...validSubtitleData,
          videoId: '123e4567-e89b-12d3-a456-426614174000',
        })
      ).not.toThrow();
    });

    it('should validate userId as UUID', () => {
      // Test invalid UUID
      expect(() => subtitleDataSchema.parse({ ...validSubtitleData, userId: 'invalid-uuid' })).toThrow('Invalid uuid');

      // Test valid UUID
      expect(() =>
        subtitleDataSchema.parse({
          ...validSubtitleData,
          userId: '123e4567-e89b-12d3-a456-426614174001',
        })
      ).not.toThrow();
    });
  });

  describe('eventSchema', () => {
    const validEvent = {
      metadata: mockMetadata,
      data: validSubtitleData,
    };

    it('should validate valid event', () => {
      expect(() => eventSchema.parse(validEvent)).not.toThrow();
    });

    it('should require metadata', () => {
      const { metadata, ...invalidEvent } = validEvent;
      expect(() => eventSchema.parse(invalidEvent)).toThrow();
    });

    it('should require data', () => {
      const { data, ...invalidEvent } = validEvent;
      expect(() => eventSchema.parse(invalidEvent)).toThrow();
    });
  });

  describe('subtitleCreatedSchema', () => {
    const validRequest = {
      body: {
        event: {
          metadata: mockMetadata,
          data: validSubtitleData,
        },
      },
      headers: {
        'content-type': 'application/json',
        'x-webhook-signature': 'test-signature',
      },
    };

    it('should validate valid request', () => {
      const result = subtitleCreatedSchema.parse(validRequest);
      expect(result).toMatchObject({
        event: validRequest.body.event,
        contentTypeHeader: 'application/json',
        signatureHeader: 'test-signature',
      });
    });

    it('should require content-type header', () => {
      const { 'content-type': _, ...invalidHeaders } = validRequest.headers;
      expect(() => subtitleCreatedSchema.parse({ ...validRequest, headers: invalidHeaders })).toThrow();
    });

    it('should require x-webhook-signature header', () => {
      const { 'x-webhook-signature': _, ...invalidHeaders } = validRequest.headers;
      expect(() => subtitleCreatedSchema.parse({ ...validRequest, headers: invalidHeaders })).toThrow();
    });

    it('should transform request correctly', () => {
      const result = subtitleCreatedSchema.parse(validRequest);
      expect(result).toEqual({
        event: validRequest.body.event,
        contentTypeHeader: validRequest.headers['content-type'],
        signatureHeader: validRequest.headers['x-webhook-signature'],
      });
    });
  });
});
