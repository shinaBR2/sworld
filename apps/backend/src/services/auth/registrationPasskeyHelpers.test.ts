import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockGenerateRegistrationOptions = vi.fn();
const mockVerifyRegistrationResponse = vi.fn();
vi.mock('@simplewebauthn/server', () => ({
  generateRegistrationOptions: (...args: unknown[]) =>
    mockGenerateRegistrationOptions(...args),
  verifyRegistrationResponse: (...args: unknown[]) =>
    mockVerifyRegistrationResponse(...args),
}));

const mockGetUser = vi.fn();
const mockGetUserPasskeys = vi.fn();
const mockSetCurrentRegistrationOptions = vi.fn();
vi.mock('./userHelpers', () => ({
  getUser: (...args: unknown[]) => mockGetUser(...args),
  getUserPasskeys: (...args: unknown[]) => mockGetUserPasskeys(...args),
  setCurrentRegistrationOptions: (...args: unknown[]) =>
    mockSetCurrentRegistrationOptions(...args),
}));

vi.mock('src/utils/logger', () => ({
  getCurrentLogger: () => ({ info: vi.fn(), error: vi.fn() }),
}));

import { generateOptions, verify } from './registrationPasskeyHelpers';

describe('registrationPasskeyHelpers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateOptions', () => {
    it('should return undefined while the user db read is unimplemented', async () => {
      const result = await generateOptions('user-1');

      expect(result).toBeUndefined();
      expect(mockGetUserPasskeys).not.toHaveBeenCalled();
      expect(mockGenerateRegistrationOptions).not.toHaveBeenCalled();
    });
  });

  describe('verify', () => {
    it('should verify a registration response for an existing user', async () => {
      const user = {
        username: 'vuong',
        passkeyRegistrationOptions: { challenge: 'reg-challenge' },
      };
      mockGetUser.mockResolvedValue({ exists: true, data: () => user });
      const verification = { verified: true, registrationInfo: {} };
      mockVerifyRegistrationResponse.mockResolvedValue(verification);

      const result = await verify('user-1', { id: 'pk-1' });

      expect(result).toEqual({ isVerified: true, verification, user });
      expect(mockVerifyRegistrationResponse).toHaveBeenCalledWith(
        expect.objectContaining({ expectedChallenge: 'reg-challenge' }),
      );
    });

    it('should return isVerified false when the user snapshot does not exist', async () => {
      mockGetUser.mockResolvedValue({ exists: false });

      const result = await verify('user-1', { id: 'pk-1' });

      expect(result).toEqual({ isVerified: false });
      expect(mockVerifyRegistrationResponse).not.toHaveBeenCalled();
    });

    it('should return isVerified false when verification throws', async () => {
      const user = {
        username: 'vuong',
        passkeyRegistrationOptions: { challenge: 'reg-challenge' },
      };
      mockGetUser.mockResolvedValue({ exists: true, data: () => user });
      mockVerifyRegistrationResponse.mockRejectedValue(
        new Error('bad challenge'),
      );

      const result = await verify('user-1', { id: 'pk-1' });

      expect(result).toEqual({ isVerified: false });
    });
  });
});
