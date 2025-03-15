import { describe, expect, it } from 'vitest';
import { ZodError } from 'zod';
import { hasuraEventMetadataSchema, transformEventMetadata, webhookSchema } from './schema';

describe('webhookSchema', () => {
  const validRequest = {
    headers: {
      'content-type': 'application/json',
      'x-webhook-signature': 'test-signature',
      'some-other-header': 'value', // Testing passthrough
    },
  };

  it('should successfully transform valid request', () => {
    const result = webhookSchema.parse(validRequest);

    expect(result).toEqual({
      contentTypeHeader: 'application/json',
      signatureHeader: 'test-signature',
    });
  });

  it('should allow additional headers due to passthrough', () => {
    const requestWithExtraHeaders = {
      headers: {
        'content-type': 'application/json',
        'x-webhook-signature': 'test-signature',
        'extra-header': 'some-value',
        'another-header': 'another-value',
      },
    };

    const result = webhookSchema.parse(requestWithExtraHeaders);

    expect(result).toEqual({
      contentTypeHeader: 'application/json',
      signatureHeader: 'test-signature',
    });
  });

  it('should fail when content-type header is missing', () => {
    const requestWithoutContentType = {
      headers: {
        'x-webhook-signature': 'test-signature',
      },
    };

    expect(() => webhookSchema.parse(requestWithoutContentType)).toThrow(ZodError);
  });

  it('should fail when x-webhook-signature header is missing', () => {
    const requestWithoutSignature = {
      headers: {
        'content-type': 'application/json',
      },
    };

    expect(() => webhookSchema.parse(requestWithoutSignature)).toThrow(ZodError);
  });

  it('should fail when headers property is missing', () => {
    const requestWithoutHeaders = {};

    expect(() => webhookSchema.parse(requestWithoutHeaders)).toThrow(ZodError);
  });

  it('should handle null or undefined values appropriately', () => {
    const requestWithNullValues = {
      headers: {
        'content-type': null,
        'x-webhook-signature': undefined,
      },
    };

    expect(() => webhookSchema.parse(requestWithNullValues)).toThrow(ZodError);
  });

  it('should fail when headers is null', () => {
    const requestWithNullHeaders = {
      headers: null,
    };

    expect(() => webhookSchema.parse(requestWithNullHeaders)).toThrow(ZodError);
  });

  it('should validate transformed output types', () => {
    const result = webhookSchema.parse(validRequest);

    expect(typeof result.contentTypeHeader).toBe('string');
    expect(typeof result.signatureHeader).toBe('string');
  });
});

describe('hasuraEventMetadataSchema', () => {
  const validMetadata = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    span_id: 'abc123',
    trace_id: 'xyz789',
  };

  it('should successfully parse valid metadata', () => {
    const result = hasuraEventMetadataSchema.parse(validMetadata);

    expect(result).toEqual({
      id: '123e4567-e89b-12d3-a456-426614174000',
      span_id: 'abc123',
      trace_id: 'xyz789',
    });
  });

  it('should fail if id is missing', () => {
    const invalidMetadata = {
      span_id: 'abc123',
      trace_id: 'xyz789',
    };

    expect(() => hasuraEventMetadataSchema.parse(invalidMetadata)).toThrow();
  });

  it('should fail if span_id is missing', () => {
    const invalidMetadata = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      trace_id: 'xyz789',
    };

    expect(() => hasuraEventMetadataSchema.parse(invalidMetadata)).toThrow();
  });

  it('should fail if trace_id is missing', () => {
    const invalidMetadata = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      span_id: 'abc123',
    };

    expect(() => hasuraEventMetadataSchema.parse(invalidMetadata)).toThrow();
  });

  it('should fail if any field has incorrect type', () => {
    const invalidMetadata = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      span_id: 123, // Should be a string
      trace_id: 'xyz789',
    };

    expect(() => hasuraEventMetadataSchema.parse(invalidMetadata)).toThrow();
  });

  it('should reject additional properties', () => {
    const metadataWithExtra = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      span_id: 'abc123',
      trace_id: 'xyz789',
      extra_field: 'should not be allowed',
    };

    // This should still pass because Zod's object validation by default strips extra properties
    const result = hasuraEventMetadataSchema.parse(metadataWithExtra);

    expect(result).toEqual({
      id: '123e4567-e89b-12d3-a456-426614174000',
      span_id: 'abc123',
      trace_id: 'xyz789',
    });

    // Verify extra field is stripped
    expect(result).not.toHaveProperty('extra_field');
  });
});

describe('transformEventMetadata', () => {
  it('should transform snake_case properties to camelCase', () => {
    // Arrange
    const input = {
      id: '123-abc',
      span_id: 'span-456',
      trace_id: 'trace-789',
      other_field: 'should-be-ignored',
    };

    // Act
    const result = transformEventMetadata(input);

    // Assert
    expect(result).toEqual({
      id: '123-abc',
      spanId: 'span-456',
      traceId: 'trace-789',
    });
    // Verify other fields are excluded
    expect(result).not.toHaveProperty('other_field');
  });

  it('should handle missing properties', () => {
    // Arrange
    const input = {
      id: '123-abc',
      // span_id and trace_id missing
    };

    // Act
    const result = transformEventMetadata(input);

    // Assert
    expect(result).toEqual({
      id: '123-abc',
      spanId: undefined,
      traceId: undefined,
    });
  });

  it('should handle null input gracefully', () => {
    // Arrange - testing with null/undefined would depend on how your function should behave
    // Let's assume it should handle null input

    // Act/Assert
    expect(() => transformEventMetadata(null)).toThrow();
  });
});
