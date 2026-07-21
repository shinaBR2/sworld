import { TelegramClient } from 'teleproto';
import { StringSession } from 'teleproto/sessions';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { tryReuseSession } from './telegram-login';

vi.mock('teleproto', () => ({
  TelegramClient: vi.fn(),
}));

vi.mock('teleproto/sessions', () => ({
  StringSession: vi.fn(),
}));

describe('tryReuseSession', () => {
  const mockConnect = vi.fn();
  const mockGetMe = vi.fn();
  const mockDisconnect = vi.fn();
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(TelegramClient).mockImplementation(
      class {
        connect = mockConnect;
        getMe = mockGetMe;
        disconnect = mockDisconnect;
      } as unknown as typeof TelegramClient,
    );
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  it('returns true and prints the identity confirmation when the existing session connects successfully', async () => {
    mockConnect.mockResolvedValue(true);
    mockGetMe.mockResolvedValue({ id: 42, username: 'vincent' });

    const result = await tryReuseSession(123, 'test-hash', 'existing-session');

    expect(result).toBe(true);
    expect(StringSession).toHaveBeenCalledWith('existing-session');
    expect(mockConnect).toHaveBeenCalledTimes(1);
    expect(mockGetMe).toHaveBeenCalledTimes(1);
    expect(mockDisconnect).toHaveBeenCalledTimes(1);
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('Existing TELEGRAM_SESSION is still valid'),
    );
  });

  it('returns false and disconnects when connect() throws for an invalid session', async () => {
    mockConnect.mockRejectedValue(new Error('AUTH_KEY_UNREGISTERED'));

    const result = await tryReuseSession(123, 'test-hash', 'existing-session');

    expect(result).toBe(false);
    expect(mockDisconnect).toHaveBeenCalledTimes(1);
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('Existing TELEGRAM_SESSION is no longer valid'),
    );
  });

  it('returns false and disconnects when getMe() throws after a successful connect', async () => {
    mockConnect.mockResolvedValue(true);
    mockGetMe.mockRejectedValue(new Error('SESSION_REVOKED'));

    const result = await tryReuseSession(123, 'test-hash', 'existing-session');

    expect(result).toBe(false);
    expect(mockDisconnect).toHaveBeenCalledTimes(1);
  });

  it('never logs the session value itself, only the identity or the error message', async () => {
    mockConnect.mockRejectedValue(new Error('AUTH_KEY_UNREGISTERED'));

    await tryReuseSession(123, 'test-hash', 'super-secret-session-string');

    const loggedText = consoleLogSpy.mock.calls.flat().join(' ');
    expect(loggedText).not.toContain('super-secret-session-string');
  });
});
