import { describe, expect, it } from 'vitest';
import { signedUploadUrlSchema } from '.';

const validInput = {
  body: {
    action: { name: 'createSignedUploadUrl' },
    input: {
      input: {
        site: 'watch',
        action: 'VIDEO_UPLOAD',
        contentType: 'video/mp4',
      },
    },
    session_variables: {
      'x-hasura-user-id': '550e8400-e29b-41d4-a716-446655440001',
    },
  },
  headers: {},
  ip: '127.0.0.1',
};

describe('signedUploadUrlSchema', () => {
  it('extracts the action args and the session user id', () => {
    const parsed = signedUploadUrlSchema.parse(validInput);
    expect(parsed).toEqual({
      site: 'watch',
      action: 'VIDEO_UPLOAD',
      id: undefined,
      contentType: 'video/mp4',
      userId: '550e8400-e29b-41d4-a716-446655440001',
    });
  });

  it('rejects an unknown site', () => {
    const bad = structuredClone(validInput);
    // biome-ignore lint/suspicious/noExplicitAny: deliberately invalid
    (bad.body.input.input as any).site = 'nope';
    expect(() => signedUploadUrlSchema.parse(bad)).toThrow();
  });

  it('rejects a missing session user id', () => {
    const bad = structuredClone(validInput);
    bad.body.session_variables = {} as typeof bad.body.session_variables;
    expect(() => signedUploadUrlSchema.parse(bad)).toThrow();
  });
});
