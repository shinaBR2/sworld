import { describe, it, expect } from 'vitest';
import { formalize, buildVariables } from './utils';

describe('formalize', () => {
  const validUUID = '123e4567-e89b-12d3-a456-426614174000';
  const validEmail = 'test@example.com';

  it('should format valid inputs with playlist correctly', () => {
    const result = formalize(validUUID, [validEmail, 'user@domain.com']);

    expect(result).toEqual({
      entityId: validUUID,
      recipients: [validEmail, 'user@domain.com'],
    });
  });

  it('should throw error for invalid entity ID', () => {
    expect(() => formalize('invalid-id', [validEmail])).toThrow('Invalid entity ID');
  });

  it('should throw error for empty recipients array', () => {
    expect(() => formalize(validUUID, [])).toThrow('Recipients must be a non-empty array');
  });

  it('should throw error for invalid email', () => {
    expect(() => formalize(validUUID, ['invalid-email'])).toThrow('Invalid email address found in recipients');
  });
});

describe('buildVariables', () => {
  const validUUID = '123e4567-e89b-12d3-a456-426614174000';
  const validEmail = 'test@example.com';

  it('should build variables for multiple recipients', () => {
    const result = buildVariables(validUUID, [validEmail, 'user@domain.com']);

    expect(result).toEqual({
      id: validUUID,
      emails: [validEmail, 'user@domain.com'],
    });
  });

  it('should build variables for multiple videos with playlist', () => {
    const result = buildVariables(validUUID, [validEmail]);

    expect(result).toEqual({
      id: validUUID,
      emails: [validEmail],
    });
  });
});
