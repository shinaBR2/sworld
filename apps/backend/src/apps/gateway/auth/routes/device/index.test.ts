import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createDeviceRequest } from './index';
import { generateHumanCode, generateSecureCode } from 'src/utils/string';
import { createDeviceRequest as createDeviceRequestMutation } from 'src/services/hasura/mutations/auth/device';
import type { DeviceRequestCreateRequest } from 'src/schema/auth/device';
import { AppError, AppResponse } from 'src/utils/schema';
import type { HandlerContext } from 'src/utils/requestHandler';

vi.mock('src/utils/string', () => ({
  generateHumanCode: vi.fn(),
  generateSecureCode: vi.fn(),
}));

vi.mock('src/services/hasura/mutations/auth/device', () => ({
  createDeviceRequest: vi.fn().mockResolvedValue({}),
}));

vi.mock('src/utils/envConfig', () => ({
  envConfig: {
    mainSiteUrl: 'https://watch.sworld.dev',
  },
}));

describe('createDeviceRequest', () => {
  const mockDate = new Date('2025-01-01T00:00:00Z');
  let dateNowSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    dateNowSpy = vi
      .spyOn(Date, 'now')
      .mockImplementation(() => mockDate.getTime());

    vi.clearAllMocks();

    vi.mocked(generateSecureCode).mockReturnValue('mock-device-code');
    vi.mocked(generateHumanCode).mockReturnValue('MOCK-123');
    vi.mocked(createDeviceRequestMutation).mockResolvedValue({
      id: '1',
      deviceCode: 'mock-device-code',
      userCode: 'MOCK-123',
    });
  });

  afterEach(() => {
    dateNowSpy.mockRestore();
  });

  const buildInput = (
    overrides?: Partial<HandlerContext<DeviceRequestCreateRequest>>,
  ): HandlerContext<DeviceRequestCreateRequest> => ({
    validatedData: {
      extensionId: 'abcdefghijklmnopabcdefghijklmnop',
      ip: '192.168.1.1',
      userAgent: 'Test User Agent',
      input: {
        input: {
          extensionId: 'abcdefghijklmnopabcdefghijklmnop',
        },
      },
      action: {
        name: 'createDeviceRequest',
      },
      hasuraActionHeader: 'createDeviceRequest',
      contentTypeHeader: 'application/json',
    },
    ...overrides,
  });

  it('should reject an invalid extension ID', async () => {
    const input = buildInput();
    input.validatedData.extensionId = 'invalid';
    input.validatedData.input.input.extensionId = 'invalid';

    const result = await createDeviceRequest(input);

    expect(result).toEqual(AppError('invalid_client'));
    expect(createDeviceRequestMutation).not.toHaveBeenCalled();
  });

  it('should generate and store device request with correct parameters', async () => {
    const result = await createDeviceRequest(buildInput());

    expect(generateSecureCode).toHaveBeenCalledWith(64);
    expect(generateHumanCode).toHaveBeenCalled();

    expect(createDeviceRequestMutation).toHaveBeenCalledWith({
      deviceCode: 'mock-device-code',
      userCode: 'MOCK-123',
      extensionId: 'abcdefghijklmnopabcdefghijklmnop',
      expiresAt: expect.any(Date),
      ipAddress: '192.168.1.1',
      userAgent: 'Test User Agent',
      status: 'pending',
    });

    const actualExpiry = vi.mocked(createDeviceRequestMutation).mock
      .calls[0]?.[0]?.expiresAt;
    expect(actualExpiry).toBeInstanceOf(Date);
    const timeDiff = actualExpiry.getTime() - mockDate.getTime();
    expect(timeDiff).toBeGreaterThanOrEqual(9.9 * 60 * 1000);
    expect(timeDiff).toBeLessThanOrEqual(10.1 * 60 * 1000);

    expect(result).toEqual(
      AppResponse(true, 'ok', {
        deviceCode: 'mock-device-code',
        userCode: 'MOCK-123',
        verification_uri: 'https://watch.sworld.dev/pair',
        verification_uri_complete:
          'https://watch.sworld.dev/pair?code=MOCK-123',
        expires_in: 600,
        interval: 5,
      }),
    );
  });

  it('should use the generated user code in the verification URI', async () => {
    vi.mocked(generateHumanCode).mockReturnValue('TEST-456');

    const result = await createDeviceRequest(buildInput());

    expect(result.dataObject?.verification_uri_complete).toBe(
      'https://watch.sworld.dev/pair?code=TEST-456',
    );
  });

  it('should handle database errors gracefully', async () => {
    const error = new Error('Database error');
    vi.mocked(createDeviceRequestMutation).mockRejectedValueOnce(error);

    await expect(createDeviceRequest(buildInput())).rejects.toThrow(
      'Database error',
    );
  });

  it('should generate different device codes for different requests', async () => {
    vi.mocked(generateSecureCode)
      .mockReturnValueOnce('first-device-code')
      .mockReturnValueOnce('second-device-code');

    await createDeviceRequest(buildInput());
    await createDeviceRequest(buildInput());

    const calls = vi.mocked(createDeviceRequestMutation).mock.calls;
    expect(calls[0]?.[0]?.deviceCode).toBe('first-device-code');
    expect(calls[1]?.[0]?.deviceCode).toBe('second-device-code');
  });

  it('should return rate_limit_exceeded when rate limit is hit', async () => {
    const input = buildInput();
    input.validatedData.extensionId = 'pppppppppppppppppppppppppppppppp';
    input.validatedData.ip = '10.0.0.1';
    input.validatedData.input.input.extensionId =
      'pppppppppppppppppppppppppppppppp';

    for (let i = 0; i < 10; i++) {
      await createDeviceRequest(input);
    }

    const result = await createDeviceRequest(input);
    expect(result).toEqual(AppError('rate_limit_exceeded'));
  });
});
