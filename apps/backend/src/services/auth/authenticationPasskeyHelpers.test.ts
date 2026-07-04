import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockGenerateAuthenticationOptions = vi.fn();
const mockVerifyAuthenticationResponse = vi.fn();
vi.mock('@simplewebauthn/server', () => ({
  generateAuthenticationOptions: (...args: unknown[]) =>
    mockGenerateAuthenticationOptions(...args),
  verifyAuthenticationResponse: (...args: unknown[]) =>
    mockVerifyAuthenticationResponse(...args),
}));

const mockGetUser = vi.fn();
const mockGetUserPasskey = vi.fn();
const mockGetUserPasskeys = vi.fn();
const mockSaveUpdatedCounter = vi.fn();
const mockSetCurrentAuthenticationOptions = vi.fn();
vi.mock('./userHelpers', () => ({
  getUser: (...args: unknown[]) => mockGetUser(...args),
  getUserPasskey: (...args: unknown[]) => mockGetUserPasskey(...args),
  getUserPasskeys: (...args: unknown[]) => mockGetUserPasskeys(...args),
  saveUpdatedCounter: (...args: unknown[]) => mockSaveUpdatedCounter(...args),
  setCurrentAuthenticationOptions: (...args: unknown[]) =>
    mockSetCurrentAuthenticationOptions(...args),
}));

vi.mock('src/utils/logger', () => ({
  getCurrentLogger: () => ({ info: vi.fn(), error: vi.fn() }),
}));

import { generateOptions, verify } from './authenticationPasskeyHelpers';

describe('authenticationPasskeyHelpers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateOptions', () => {
    it('should build options from the user passkeys and store them', async () => {
      const options = { challenge: 'auth-challenge' };
      mockGetUserPasskeys.mockResolvedValue([
        { id: 'pk-1', transports: ['internal'] },
      ]);
      mockGenerateAuthenticationOptions.mockResolvedValue(options);

      const result = await generateOptions('user-1');

      expect(result).toEqual(options);
      expect(mockGenerateAuthenticationOptions).toHaveBeenCalledWith(
        expect.objectContaining({
          allowCredentials: [{ id: 'pk-1', transports: ['internal'] }],
        }),
      );
      expect(mockSetCurrentAuthenticationOptions).toHaveBeenCalledWith(
        'user-1',
        options,
      );
    });
  });

  describe('verify', () => {
    it('should verify a credential and update the passkey counter', async () => {
      const user = {
        id: 'user-1',
        passkeyAuthenticationOptions: { challenge: 'auth-challenge' },
      };
      mockGetUser.mockResolvedValue({ exists: true, data: () => user });
      mockGetUserPasskey.mockResolvedValue({
        id: 'pk-1',
        publicKey: new Uint8Array([1, 2, 3]),
        counter: 1,
        transports: ['internal'],
      });
      mockVerifyAuthenticationResponse.mockResolvedValue({
        verified: true,
        authenticationInfo: { newCounter: 2 },
      });

      const result = await verify('user-1', { id: 'pk-1' });

      expect(result).toEqual({ isVerified: true });
      expect(mockVerifyAuthenticationResponse).toHaveBeenCalledWith(
        expect.objectContaining({ expectedChallenge: 'auth-challenge' }),
      );
      expect(mockSaveUpdatedCounter).toHaveBeenCalledWith('user-1', 'pk-1', 2);
    });

    it('should return isVerified false when the user snapshot does not exist', async () => {
      mockGetUser.mockResolvedValue({ exists: false });

      const result = await verify('user-1', { id: 'pk-1' });

      expect(result).toEqual({ isVerified: false });
      expect(mockVerifyAuthenticationResponse).not.toHaveBeenCalled();
    });

    it('should return isVerified false when verification throws', async () => {
      const user = {
        id: 'user-1',
        passkeyAuthenticationOptions: { challenge: 'auth-challenge' },
      };
      mockGetUser.mockResolvedValue({ exists: true, data: () => user });
      mockGetUserPasskey.mockResolvedValue({
        id: 'pk-1',
        publicKey: new Uint8Array([1, 2, 3]),
        counter: 1,
        transports: ['internal'],
      });
      mockVerifyAuthenticationResponse.mockRejectedValue(
        new Error('bad challenge'),
      );

      const result = await verify('user-1', { id: 'pk-1' });

      expect(result).toEqual({ isVerified: false });
      expect(mockSaveUpdatedCounter).not.toHaveBeenCalled();
    });
  });
});
