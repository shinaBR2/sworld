import {
  TelegramCodeExpiredError,
  TelegramError,
  TelegramInvalidCodeError,
  TelegramLoginNotStartedError,
  TelegramMisconfiguredError,
  TelegramNotAuthenticatedError,
  TelegramNotProvisionedError,
  TelegramSessionPersistError,
  TelegramSignUpRequiredError,
  TelegramTwoFactorNotSupportedError,
} from 'src/services/telegram/errors';
import { describe, expect, it } from 'vitest';
import { toTelegramActionErrorCode } from './errors';

const USER = '550e8400-e29b-41d4-a716-446655440001';

describe('toTelegramActionErrorCode', () => {
  it.each([
    [new TelegramNotAuthenticatedError(USER), 'NO_SESSION'],
    [new TelegramNotProvisionedError(USER), 'NOT_PROVISIONED'],
    [new TelegramMisconfiguredError(USER), 'MISCONFIGURED'],
    [new TelegramLoginNotStartedError(USER), 'LOGIN_NOT_STARTED'],
    [new TelegramInvalidCodeError(USER), 'INVALID_CODE'],
    [new TelegramCodeExpiredError(USER), 'CODE_EXPIRED'],
    [new TelegramSignUpRequiredError(USER), 'SIGNUP_REQUIRED'],
    [new TelegramTwoFactorNotSupportedError(USER), 'TWO_FACTOR_UNSUPPORTED'],
    [new TelegramSessionPersistError(USER), 'PERSIST_FAILED'],
  ])('maps %s to its stable code', (error, expected) => {
    expect(toTelegramActionErrorCode(error)).toBe(expected);
  });

  it('returns undefined for a non-Telegram error so the caller uses a generic message', () => {
    expect(toTelegramActionErrorCode(new Error('random'))).toBeUndefined();
    expect(toTelegramActionErrorCode('a string')).toBeUndefined();
    expect(toTelegramActionErrorCode(null)).toBeUndefined();
  });

  it('returns undefined for an unmapped TelegramError subclass — never leaks its class name', () => {
    class TelegramSomethingNewError extends TelegramError {
      constructor(userId: string) {
        super('brand new failure', userId);
        this.name = 'TelegramSomethingNewError';
      }
    }
    // No entry in CODE_BY_ERROR → generic + logged, not the class name as a code.
    expect(
      toTelegramActionErrorCode(new TelegramSomethingNewError(USER)),
    ).toBeUndefined();
  });
});
