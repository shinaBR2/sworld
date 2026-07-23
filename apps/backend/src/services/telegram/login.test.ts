import {
  saveTelegramPendingLogin,
  saveTelegramSession,
} from 'src/services/hasura/mutations/telegram';
import { getTelegramCredentialsByUserId } from 'src/services/hasura/queries/telegram';
import { Api, TelegramClient } from 'teleproto';
import { StringSession } from 'teleproto/sessions';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  TelegramCodeExpiredError,
  TelegramInvalidCodeError,
  TelegramLoginNotStartedError,
  TelegramMisconfiguredError,
  TelegramNotProvisionedError,
  TelegramSessionPersistError,
  TelegramSignUpRequiredError,
  TelegramTwoFactorNotSupportedError,
} from './errors';
import { requestLoginCode, submitLoginCode } from './login';

// vi.fn() + prototype methods: a plain vi.fn is constructable (unlike a
// vi.fn(arrow), which throws "not a constructor" on `new`), and prototype
// methods are shared across instances so the login flow's single client can be
// asserted via TelegramClientMock.prototype.*.
const { TelegramClientMock, StringSessionMock, SignUpRequiredMock } =
  vi.hoisted(() => {
    const clientCtor = vi.fn();
    clientCtor.prototype.connect = vi.fn();
    clientCtor.prototype.sendCode = vi.fn();
    clientCtor.prototype.invoke = vi.fn();
    clientCtor.prototype.disconnect = vi.fn();
    const sessionCtor = vi.fn();
    sessionCtor.prototype.save = vi.fn(() => 'saved-session');
    // A real class so submitLoginCode's `result instanceof
    // Api.auth.AuthorizationSignUpRequired` check is exercisable; referenced
    // directly in tests (not through the typed Api) so its zero-arg constructor
    // doesn't clash with teleproto's real 1-arg signature under tsc.
    class SignUpRequiredMock {}
    return {
      TelegramClientMock: clientCtor,
      StringSessionMock: sessionCtor,
      SignUpRequiredMock,
    };
  });

const mockClient = TelegramClientMock.prototype;

vi.mock('teleproto', () => ({
  TelegramClient: TelegramClientMock,
  Api: {
    auth: {
      SignIn: vi.fn(),
      AuthorizationSignUpRequired: SignUpRequiredMock,
    },
  },
}));

vi.mock('teleproto/sessions', () => ({
  StringSession: StringSessionMock,
}));

vi.mock('src/services/hasura/queries/telegram', () => ({
  getTelegramCredentialsByUserId: vi.fn(),
}));

vi.mock('src/services/hasura/mutations/telegram', () => ({
  saveTelegramPendingLogin: vi.fn(),
  saveTelegramSession: vi.fn(),
}));

const credentials = (overrides = {}) => ({
  phoneNumber: '+15551234567',
  apiId: '111',
  apiHash: 'hash-1',
  sessionString: null,
  pendingSessionString: null,
  pendingPhoneCodeHash: null,
  ...overrides,
});

describe('requestLoginCode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockClient.connect.mockResolvedValue(undefined);
    mockClient.disconnect.mockResolvedValue(undefined);
    mockClient.sendCode.mockResolvedValue({
      phoneCodeHash: 'code-hash',
      isCodeViaApp: true,
    });
  });

  it('sends the code and persists the intermediate session + phone_code_hash', async () => {
    vi.mocked(getTelegramCredentialsByUserId).mockResolvedValueOnce(
      credentials(),
    );
    vi.mocked(saveTelegramPendingLogin).mockResolvedValueOnce(1);

    await requestLoginCode('user-1');

    expect(mockClient.connect).toHaveBeenCalledOnce();
    expect(mockClient.sendCode).toHaveBeenCalledWith(
      { apiId: 111, apiHash: 'hash-1' },
      '+15551234567',
    );
    expect(saveTelegramPendingLogin).toHaveBeenCalledWith({
      userId: 'user-1',
      pendingSessionString: 'saved-session',
      phoneCodeHash: 'code-hash',
    });
    expect(mockClient.disconnect).toHaveBeenCalledOnce();
  });

  it('trims a whitespace-padded phone number and api_hash before contacting Telegram', async () => {
    // loadTelegramCredentials normalizes the hand-provisioned static fields, so a
    // copy-paste slip with surrounding whitespace reaches sendCode cleaned rather
    // than as an opaque MTProto auth failure.
    vi.mocked(getTelegramCredentialsByUserId).mockResolvedValueOnce(
      credentials({ phoneNumber: '  +15551234567  ', apiHash: '  hash-1  ' }),
    );
    vi.mocked(saveTelegramPendingLogin).mockResolvedValueOnce(1);

    await requestLoginCode('user-1');

    expect(mockClient.sendCode).toHaveBeenCalledWith(
      { apiId: 111, apiHash: 'hash-1' },
      '+15551234567',
    );
  });

  it('throws (and never builds a client) when the user is not provisioned', async () => {
    vi.mocked(getTelegramCredentialsByUserId).mockResolvedValueOnce(null);

    await expect(requestLoginCode('nobody')).rejects.toBeInstanceOf(
      TelegramNotProvisionedError,
    );
    expect(TelegramClient).not.toHaveBeenCalled();
  });

  // phone_number is required by the login path (it feeds sendCode), so it is
  // validated here rather than on the client-build path that never uses it.
  it.each([
    ['blank phone_number', { phoneNumber: '' }],
    ['whitespace-only phone_number', { phoneNumber: '   ' }],
  ])(
    'throws TelegramMisconfiguredError (and never builds a client) on %s',
    async (_label, overrides) => {
      vi.mocked(getTelegramCredentialsByUserId).mockResolvedValueOnce(
        credentials(overrides),
      );

      await expect(requestLoginCode('user-1')).rejects.toBeInstanceOf(
        TelegramMisconfiguredError,
      );
      expect(TelegramClient).not.toHaveBeenCalled();
    },
  );

  it('throws (still disconnecting) when the row vanished before the write', async () => {
    vi.mocked(getTelegramCredentialsByUserId).mockResolvedValueOnce(
      credentials(),
    );
    vi.mocked(saveTelegramPendingLogin).mockResolvedValueOnce(0);

    await expect(requestLoginCode('user-1')).rejects.toBeInstanceOf(
      TelegramNotProvisionedError,
    );
    expect(mockClient.disconnect).toHaveBeenCalledOnce();
  });

  it('surfaces a typed TelegramSessionPersistError when the pending-login persist fails after all retries', async () => {
    // Symmetric with submitLoginCode: a raw persist error would be unroutable by
    // the gateway; the pending persist must fail typed too.
    vi.useFakeTimers();
    try {
      vi.mocked(getTelegramCredentialsByUserId).mockResolvedValueOnce(
        credentials(),
      );
      vi.mocked(saveTelegramPendingLogin).mockRejectedValue(
        new Error('persistent hasura error'),
      );

      const pending = requestLoginCode('user-1');
      const assertion = expect(pending).rejects.toBeInstanceOf(
        TelegramSessionPersistError,
      );
      await vi.runAllTimersAsync();
      await assertion;

      expect(mockClient.disconnect).toHaveBeenCalledOnce();
    } finally {
      vi.mocked(saveTelegramPendingLogin).mockReset();
      vi.useRealTimers();
    }
  });

  // sendCode is the first Telegram contact with the provisioned phone, so
  // phone-level RPC errors surface here and must be mapped to the typed taxonomy.
  it.each([
    ['PHONE_NUMBER_INVALID', TelegramMisconfiguredError],
    ['PHONE_NUMBER_BANNED', TelegramMisconfiguredError],
    ['PHONE_NUMBER_UNOCCUPIED', TelegramSignUpRequiredError],
  ])(
    'maps sendCode %s to a typed error (never persists)',
    async (errorMessage, ErrorType) => {
      vi.mocked(getTelegramCredentialsByUserId).mockResolvedValueOnce(
        credentials(),
      );
      mockClient.sendCode.mockRejectedValueOnce({ errorMessage });

      await expect(requestLoginCode('user-1')).rejects.toBeInstanceOf(
        ErrorType,
      );
      expect(saveTelegramPendingLogin).not.toHaveBeenCalled();
      expect(mockClient.disconnect).toHaveBeenCalledOnce();
    },
  );
});

describe('submitLoginCode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockClient.connect.mockResolvedValue(undefined);
    mockClient.disconnect.mockResolvedValue(undefined);
    mockClient.invoke.mockResolvedValue(undefined);
  });

  it('signs in with the code and persists the authorized session', async () => {
    vi.mocked(getTelegramCredentialsByUserId).mockResolvedValueOnce(
      credentials({
        pendingSessionString: 'intermediate-session',
        pendingPhoneCodeHash: 'code-hash',
      }),
    );
    vi.mocked(saveTelegramSession).mockResolvedValueOnce(1);

    await submitLoginCode('user-1', '12345');

    expect(StringSession).toHaveBeenCalledWith('intermediate-session');
    expect(Api.auth.SignIn).toHaveBeenCalledWith({
      phoneNumber: '+15551234567',
      phoneCodeHash: 'code-hash',
      phoneCode: '12345',
    });
    expect(mockClient.invoke).toHaveBeenCalledOnce();
    expect(saveTelegramSession).toHaveBeenCalledWith({
      userId: 'user-1',
      sessionString: 'saved-session',
    });
    expect(mockClient.disconnect).toHaveBeenCalledOnce();
  });

  it('retries the session persist on a transient failure so the authorized session is not lost', async () => {
    // auth.SignIn is irreversible — the code is consumed. If the persist blipped
    // transiently and propagated raw, a retry would re-run SignIn with the spent
    // code and surface a misleading "invalid code". withRetry absorbs the blip.
    vi.useFakeTimers();
    try {
      vi.mocked(getTelegramCredentialsByUserId).mockResolvedValueOnce(
        credentials({
          pendingSessionString: 'intermediate-session',
          pendingPhoneCodeHash: 'code-hash',
        }),
      );
      vi.mocked(saveTelegramSession)
        .mockRejectedValueOnce(new Error('transient hasura error'))
        .mockResolvedValueOnce(1);

      const pending = submitLoginCode('user-1', '12345');
      await vi.runAllTimersAsync();
      await expect(pending).resolves.toBeUndefined();

      expect(saveTelegramSession).toHaveBeenCalledTimes(2);
      expect(mockClient.invoke).toHaveBeenCalledOnce();
    } finally {
      vi.useRealTimers();
    }
  });

  it('throws TelegramSignUpRequiredError (and never persists) when the phone has no account', async () => {
    // auth.SignIn RESOLVES with AuthorizationSignUpRequired for an unregistered
    // phone — the session is not authorized and must not reach session_string.
    vi.mocked(getTelegramCredentialsByUserId).mockResolvedValueOnce(
      credentials({
        pendingSessionString: 'intermediate-session',
        pendingPhoneCodeHash: 'code-hash',
      }),
    );
    mockClient.invoke.mockResolvedValueOnce(new SignUpRequiredMock());

    await expect(submitLoginCode('user-1', '12345')).rejects.toBeInstanceOf(
      TelegramSignUpRequiredError,
    );
    expect(saveTelegramSession).not.toHaveBeenCalled();
    expect(mockClient.disconnect).toHaveBeenCalledOnce();
  });

  it.each(['PHONE_CODE_INVALID', 'PHONE_CODE_EMPTY'])(
    'maps %s to TelegramInvalidCodeError (re-prompt on same session, never persisted)',
    async (errorMessage) => {
      vi.mocked(getTelegramCredentialsByUserId).mockResolvedValueOnce(
        credentials({
          pendingSessionString: 'intermediate-session',
          pendingPhoneCodeHash: 'code-hash',
        }),
      );
      mockClient.invoke.mockRejectedValueOnce({ errorMessage });

      await expect(submitLoginCode('user-1', '99999')).rejects.toBeInstanceOf(
        TelegramInvalidCodeError,
      );
      expect(saveTelegramSession).not.toHaveBeenCalled();
      expect(mockClient.disconnect).toHaveBeenCalledOnce();
    },
  );

  it('maps PHONE_CODE_EXPIRED to TelegramCodeExpiredError, not the wrong-code bucket', async () => {
    // Expired needs a different recovery (fresh code, not re-prompt), so it must
    // be a distinct type or the popup loops on "invalid code".
    vi.mocked(getTelegramCredentialsByUserId).mockResolvedValueOnce(
      credentials({
        pendingSessionString: 'intermediate-session',
        pendingPhoneCodeHash: 'code-hash',
      }),
    );
    mockClient.invoke.mockRejectedValueOnce({
      errorMessage: 'PHONE_CODE_EXPIRED',
    });

    await expect(submitLoginCode('user-1', '12345')).rejects.toBeInstanceOf(
      TelegramCodeExpiredError,
    );
    expect(saveTelegramSession).not.toHaveBeenCalled();
    expect(mockClient.disconnect).toHaveBeenCalledOnce();
  });

  it('surfaces a typed TelegramSessionPersistError when the persist fails after all retries', async () => {
    // auth.SignIn already consumed the code; if the persist can't be saved, the
    // error must be typed/routable (not the raw hasura error) and must NOT be a
    // misleading "invalid code".
    vi.useFakeTimers();
    try {
      vi.mocked(getTelegramCredentialsByUserId).mockResolvedValueOnce(
        credentials({
          pendingSessionString: 'intermediate-session',
          pendingPhoneCodeHash: 'code-hash',
        }),
      );
      vi.mocked(saveTelegramSession).mockRejectedValue(
        new Error('persistent hasura error'),
      );

      const pending = submitLoginCode('user-1', '12345');
      // Attach a rejection handler before advancing timers so the eventual
      // rejection is never an unhandled one while withRetry backs off.
      const assertion = expect(pending).rejects.toBeInstanceOf(
        TelegramSessionPersistError,
      );
      await vi.runAllTimersAsync();
      await assertion;

      expect(mockClient.disconnect).toHaveBeenCalledOnce();
    } finally {
      vi.mocked(saveTelegramSession).mockReset();
      vi.useRealTimers();
    }
  });

  it('preserves the original RPCError as `cause` on the mapped typed error', async () => {
    // A mapped failure must not discard the raw teleproto error — the synthetic
    // message alone can't confirm which RPCError fired or catch a Telegram
    // error-string change.
    vi.mocked(getTelegramCredentialsByUserId).mockResolvedValueOnce(
      credentials({
        pendingSessionString: 'intermediate-session',
        pendingPhoneCodeHash: 'code-hash',
      }),
    );
    const rpcError = { errorMessage: 'PHONE_CODE_INVALID' };
    mockClient.invoke.mockRejectedValueOnce(rpcError);

    await expect(submitLoginCode('user-1', '99999')).rejects.toMatchObject({
      cause: rpcError,
    });
  });

  it('maps SESSION_PASSWORD_NEEDED to TelegramTwoFactorNotSupportedError', async () => {
    vi.mocked(getTelegramCredentialsByUserId).mockResolvedValueOnce(
      credentials({
        pendingSessionString: 'intermediate-session',
        pendingPhoneCodeHash: 'code-hash',
      }),
    );
    mockClient.invoke.mockRejectedValueOnce({
      errorMessage: 'SESSION_PASSWORD_NEEDED',
    });

    await expect(submitLoginCode('user-1', '12345')).rejects.toBeInstanceOf(
      TelegramTwoFactorNotSupportedError,
    );
    expect(saveTelegramSession).not.toHaveBeenCalled();
    expect(mockClient.disconnect).toHaveBeenCalledOnce();
  });

  it('throws TelegramLoginNotStartedError when there is no pending login', async () => {
    // Authorized session but no requestLoginCode in flight (pending fields null).
    vi.mocked(getTelegramCredentialsByUserId).mockResolvedValueOnce(
      credentials({ sessionString: 'authorized-session' }),
    );

    await expect(submitLoginCode('user-1', '12345')).rejects.toBeInstanceOf(
      TelegramLoginNotStartedError,
    );
    expect(mockClient.invoke).not.toHaveBeenCalled();
  });

  it('throws TelegramNotProvisionedError when the user has no row', async () => {
    vi.mocked(getTelegramCredentialsByUserId).mockResolvedValueOnce(null);

    await expect(submitLoginCode('nobody', '12345')).rejects.toBeInstanceOf(
      TelegramNotProvisionedError,
    );
  });
});
