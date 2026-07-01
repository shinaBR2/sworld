import { describe, expect, it } from 'vitest';
import { setThumbnailAtTimeSchema } from '.';

const VIDEO_ID = '550e8400-e29b-41d4-a716-446655440000';
const USER_ID = '550e8400-e29b-41d4-a716-446655440001';

const makeBody = (input: Record<string, unknown>, userId?: string) => ({
  body: {
    action: { name: 'setVideoThumbnailAtTime' },
    input: { input },
    session_variables: {
      'x-hasura-user-id': userId ?? USER_ID,
    },
  },
});

describe('setThumbnailAtTimeSchema', () => {
  it('parses valid args and pulls userId from the session', () => {
    const parsed = setThumbnailAtTimeSchema.parse(
      makeBody({ videoId: VIDEO_ID, atSeconds: 12.5 }),
    );

    expect(parsed).toEqual({
      videoId: VIDEO_ID,
      atSeconds: 12.5,
      userId: USER_ID,
    });
  });

  it('accepts atSeconds of 0', () => {
    const parsed = setThumbnailAtTimeSchema.parse(
      makeBody({ videoId: VIDEO_ID, atSeconds: 0 }),
    );
    expect(parsed.atSeconds).toBe(0);
  });

  it('rejects a negative atSeconds', () => {
    expect(() =>
      setThumbnailAtTimeSchema.parse(
        makeBody({ videoId: VIDEO_ID, atSeconds: -1 }),
      ),
    ).toThrow();
  });

  it('rejects a non-uuid videoId', () => {
    expect(() =>
      setThumbnailAtTimeSchema.parse(
        makeBody({ videoId: 'not-a-uuid', atSeconds: 5 }),
      ),
    ).toThrow();
  });

  it('rejects a missing atSeconds', () => {
    expect(() =>
      setThumbnailAtTimeSchema.parse(makeBody({ videoId: VIDEO_ID })),
    ).toThrow();
  });

  it('rejects a non-numeric atSeconds', () => {
    expect(() =>
      setThumbnailAtTimeSchema.parse(
        makeBody({ videoId: VIDEO_ID, atSeconds: '5' }),
      ),
    ).toThrow();
  });

  it('rejects a missing session user id', () => {
    const body = {
      body: {
        action: { name: 'setVideoThumbnailAtTime' },
        input: { input: { videoId: VIDEO_ID, atSeconds: 5 } },
        session_variables: {},
      },
    };
    expect(() => setThumbnailAtTimeSchema.parse(body)).toThrow();
  });
});
