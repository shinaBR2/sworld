import { ClientError } from 'graphql-request';
import { describe, expect, it } from 'vitest';
import { redactHasuraError } from './redactError';

describe('redactHasuraError', () => {
  it('drops the request variables (session secret) and keeps only the GraphQL error text', () => {
    const secret = '1AgSECRETauthorizedSession';
    const clientError = new ClientError(
      { errors: [{ message: 'permission denied' }], status: 400 } as never,
      {
        query: 'mutation SaveTelegramSession { ... }',
        variables: { userId: 'u1', sessionString: secret },
      },
    );
    // Sanity: the RAW ClientError does leak the secret in its message — that is
    // exactly the bug this helper exists to prevent from reaching a log.
    expect(clientError.message).toContain(secret);

    const redacted = redactHasuraError('saveTelegramSession', clientError);

    expect(redacted.message).not.toContain(secret);
    expect(redacted.message).toContain('permission denied');
    expect(redacted.message).toContain('saveTelegramSession');
    // No raw ClientError threaded as cause — that would re-leak downstream.
    expect(redacted.cause).toBeUndefined();
  });

  it('relabels a non-ClientError (no variables in its message) as-is, with no cause', () => {
    const redacted = redactHasuraError('op', new Error('socket hang up'));

    expect(redacted.message).toBe('op failed: socket hang up');
    expect(redacted.cause).toBeUndefined();
  });
});
