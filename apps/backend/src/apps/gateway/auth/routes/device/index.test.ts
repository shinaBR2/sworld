import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createDeviceRequest } from './index';
import { generateHumanCode, generateSecureCode } from 'src/utils/string';
import { createDeviceRequest as createDeviceRequestMutation } from 'src/services/hasura/mutations/auth/device';
import { envConfig } from 'src/utils/envConfig';
import type { DeviceRequestCreateRequest } from 'src/schema/auth/device';
import { AppResponse } from 'src/utils/schema';

// Mock dependencies
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
  const mockInput: DeviceRequestCreateRequest = {
    extensionId: 'ext-123',
    ip: '192.168.1.1',
    userAgent: 'Test User Agent',
    input: {
      input: {
        extensionId: 'ext-123',
      },
    },
  };

  const mockDate = new Date('2025-01-01T00:00:00Z');
  let dateNowSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // Mock Date.now() to return a fixed timestamp
    dateNowSpy = vi
      .spyOn(Date, 'now')
      .mockImplementation(() => mockDate.getTime());

    // Reset all mocks
    vi.clearAllMocks();

    // Setup default mock implementations
    vi.mocked(generateSecureCode).mockReturnValue('mock-device-code');
    vi.mocked(generateHumanCode).mockReturnValue('MOCK-123');
    vi.mocked(createDeviceRequestMutation).mockResolvedValue({
      id: '1',
      deviceCode: 'mock-device-code',
      userCode: 'MOCK-123',
    });
  });

  afterEach(() => {
    // Restore the original Date.now()
    dateNowSpy.mockRestore();
  });

  it('should generate and store device request with correct parameters', async () => {
    const result = await createDeviceRequest(mockInput);

    // Verify codes were generated
    expect(generateSecureCode).toHaveBeenCalledWith(64);
    expect(generateHumanCode).toHaveBeenCalled();

    // Verify database call
    const expectedExpiry = new Date(mockDate.getTime() + 10 * 60 * 1000);
    expect(createDeviceRequestMutation).toHaveBeenCalledWith({
      deviceCode: 'mock-device-code',
      userCode: 'MOCK-123',
      extensionId: 'ext-123',
      expiresAt: expect.any(Date),
      ipAddress: '192.168.1.1',
      userAgent: 'Test User Agent',
      status: 'pending',
    });

    // Verify expiry date is approximately 10 minutes from now
    const actualExpiry = vi.mocked(createDeviceRequestMutation).mock
      .calls[0]?.[0]?.expiresAt;
    expect(actualExpiry).toBeInstanceOf(Date);
    const timeDiff = actualExpiry.getTime() - mockDate.getTime();
    expect(timeDiff).toBeGreaterThanOrEqual(9.9 * 60 * 1000); // 9.9 minutes
    expect(timeDiff).toBeLessThanOrEqual(10.1 * 60 * 1000); // 10.1 minutes

    // Verify return value
    expect(result).toEqual(
      AppResponse(true, 'ok', {
        deviceCode: 'mock-device-code',
        userCode: 'MOCK-123',
        verification_uri: 'https://watch.sworld.dev/pair',
        verification_uri_complete:
          'https://watch.sworld.dev/pair?code=MOCK-123',
        expires_in: 600, // 10 minutes in seconds
        interval: 5, // 5 seconds
      }),
    );
  });

  it('should use the generated user code in the verification URI', async () => {
    vi.mocked(generateHumanCode).mockReturnValue('TEST-456');

    const result = await createDeviceRequest(mockInput);

    expect(result.dataObject.verification_uri_complete).toBe(
      'https://watch.sworld.dev/pair?code=TEST-456',
    );
  });

  it('should handle database errors gracefully', async () => {
    const error = new Error('Database error');
    vi.mocked(createDeviceRequestMutation).mockRejectedValueOnce(error);

    await expect(createDeviceRequest(mockInput)).rejects.toThrow(
      'Database error',
    );
  });

  it('should generate different device codes for different requests', async () => {
    vi.mocked(generateSecureCode)
      .mockReturnValueOnce('first-device-code')
      .mockReturnValueOnce('second-device-code');

    await createDeviceRequest(mockInput);
    await createDeviceRequest(mockInput);

    const calls = vi.mocked(createDeviceRequestMutation).mock.calls;
    expect(calls[0]?.[0]?.deviceCode).toBe('first-device-code');
    expect(calls[1]?.[0]?.deviceCode).toBe('second-device-code');
  });
});
