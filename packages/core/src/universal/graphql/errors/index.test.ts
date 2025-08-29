import { describe, expect, it } from 'vitest';
import { isTokenExpired } from './index';

describe('isTokenExpired', () => {
  it('should return true when error contains invalid-jwt code', () => {
    const error = {
      response: {
        errors: [
          {
            extensions: {
              code: 'invalid-jwt',
            },
          },
        ],
      },
    };

    const result = isTokenExpired(error);

    expect(result).toBe(true);
  });

  it('should return false when error contains different error codes', () => {
    const error = {
      response: {
        errors: [
          {
            extensions: {
              code: 'validation-failed',
            },
          },
          {
            extensions: {
              code: 'unauthorized',
            },
          },
        ],
      },
    };

    const result = isTokenExpired(error);

    expect(result).toBe(false);
  });

  it('should return true when one of multiple errors contains invalid-jwt', () => {
    const error = {
      response: {
        errors: [
          {
            extensions: {
              code: 'validation-failed',
            },
          },
          {
            extensions: {
              code: 'invalid-jwt',
            },
          },
          {
            extensions: {
              code: 'unauthorized',
            },
          },
        ],
      },
    };

    const result = isTokenExpired(error);

    expect(result).toBe(true);
  });

  it('should return false when error.response is undefined', () => {
    const error = {
      message: 'Network error',
    };

    const result = isTokenExpired(error);

    expect(result).toBe(false);
  });

  it('should return false when error.response.errors is undefined', () => {
    const error = {
      response: {
        data: null,
      },
    };

    const result = isTokenExpired(error);

    expect(result).toBe(false);
  });

  it('should return false when error.response.errors is empty array', () => {
    const error = {
      response: {
        errors: [],
      },
    };

    const result = isTokenExpired(error);

    expect(result).toBe(false);
  });

  it('should return false when error.response.errors contains objects without extensions', () => {
    const error = {
      response: {
        errors: [
          {
            message: 'Some error without extensions',
          },
        ],
      },
    };

    const result = isTokenExpired(error);

    expect(result).toBe(false);
  });

  it('should return false when error.response.errors contains objects with extensions but no code', () => {
    const error = {
      response: {
        errors: [
          {
            extensions: {
              path: 'user.id',
            },
          },
        ],
      },
    };

    const result = isTokenExpired(error);

    expect(result).toBe(false);
  });

  it('should return false when error is null', () => {
    const result = isTokenExpired(null);

    expect(result).toBe(false);
  });

  it('should return false when error is undefined', () => {
    const result = isTokenExpired(undefined);

    expect(result).toBe(false);
  });

  it('should return false when error is an empty object', () => {
    const error = {};

    const result = isTokenExpired(error);

    expect(result).toBe(false);
  });

  it('should handle malformed error structures gracefully', () => {
    const error = {
      response: {
        errors: 'not an array',
      },
    };

    const result = isTokenExpired(error);

    expect(result).toBe(false);
  });
});
