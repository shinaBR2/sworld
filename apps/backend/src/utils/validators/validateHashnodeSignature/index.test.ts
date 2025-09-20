// test/validateHashnodeSignature.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { validateHashnodeSignature } from 'src/utils/validators/validateHashnodeSignature';
import { CustomError } from 'src/utils/custom-error';

// Mock dependencies
vi.mock('src/utils/envConfig', () => ({
  envConfig: {
    hashnodeWebhookSecret: 'test-secret-key',
  },
}));

vi.mock('./validator', () => ({
  validateSignature: vi.fn(),
}));

vi.mock('../src/utils/custom-error');
vi.mock('../src/utils/error-codes', () => ({
  VALIDATION_ERRORS: {
    INVALID_SIGNATURE: 'INVALID_SIGNATURE',
  },
}));

describe('validateHashnodeSignature', async () => {
  const { validateSignature } = await import('./validator');
  const mockValidateSignature = vi.mocked(validateSignature);

  const mockContext = {
    req: {
      header: vi.fn(),
      raw: {
        clone: vi.fn().mockReturnValue({
          text: vi.fn(),
        }),
      },
    },
  };

  const mockNext = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockContext.req.header.mockReturnValue('test-signature');
    mockContext.req.raw.clone().text.mockResolvedValue('{"message":"test"}');
  });

  it('should pass validation with valid signature', async () => {
    mockValidateSignature.mockReturnValue({
      isValid: true,
      reason: null,
    });

    const middleware = validateHashnodeSignature();
    await middleware(mockContext as any, mockNext);

    expect(mockValidateSignature).toHaveBeenCalledWith({
      incomingSignatureHeader: 'test-signature',
      payload: { message: 'test' },
      secret: 'test-secret-key',
    });
    expect(mockNext).toHaveBeenCalledOnce();
  });

  it('should throw error when signature header is missing', async () => {
    mockContext.req.header.mockReturnValue(undefined);

    const middleware = validateHashnodeSignature();

    await expect(middleware(mockContext as any, mockNext)).rejects.toThrow();
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should throw CustomError when signature validation fails', async () => {
    mockValidateSignature.mockReturnValue({
      isValid: false,
      reason: 'Signature mismatch',
    });

    const middleware = validateHashnodeSignature();

    await expect(middleware(mockContext as any, mockNext)).rejects.toThrow();
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should handle JSON parsing errors', async () => {
    mockContext.req.raw.clone().text.mockResolvedValue('invalid-json');

    const middleware = validateHashnodeSignature();

    await expect(middleware(mockContext as any, mockNext)).rejects.toThrow();
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should re-throw CustomError instances', async () => {
    const customError = new CustomError('Test error', {});
    mockValidateSignature.mockImplementation(() => {
      throw customError;
    });

    const middleware = validateHashnodeSignature();

    await expect(middleware(mockContext as any, mockNext)).rejects.toThrow(
      customError,
    );
  });

  it('should wrap non-CustomError instances in CustomError', async () => {
    const regularError = new Error('Regular error');
    mockValidateSignature.mockImplementation(() => {
      throw regularError;
    });

    const middleware = validateHashnodeSignature();

    await expect(middleware(mockContext as any, mockNext)).rejects.toThrow();
  });
});
