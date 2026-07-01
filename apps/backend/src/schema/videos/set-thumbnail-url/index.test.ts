import { describe, expect, it } from 'vitest';
import { setThumbnailUrlSchema } from '.';

const VIDEO_ID = '550e8400-e29b-41d4-a716-446655440000';
const USER_ID = '550e8400-e29b-41d4-a716-446655440001';
const OBJECT_PATH = `videos/${USER_ID}/${VIDEO_ID}/abc.jpg`;

const makeBody = (input: Record<string, unknown>, userId?: string) => ({
  body: {
    action: { name: 'setVideoThumbnailUrl' },
    input: { input },
    session_variables: {
      'x-hasura-user-id': userId ?? USER_ID,
    },
  },
});

describe('setThumbnailUrlSchema', () => {
  it('parses valid args and pulls userId from the session', () => {
    const parsed = setThumbnailUrlSchema.parse(
      makeBody({ videoId: VIDEO_ID, objectPath: OBJECT_PATH }),
    );

    expect(parsed).toEqual({
      videoId: VIDEO_ID,
      objectPath: OBJECT_PATH,
      userId: USER_ID,
    });
  });

  it('rejects a non-uuid videoId', () => {
    expect(() =>
      setThumbnailUrlSchema.parse(
        makeBody({ videoId: 'not-a-uuid', objectPath: OBJECT_PATH }),
      ),
    ).toThrow();
  });

  it('rejects a missing objectPath', () => {
    expect(() =>
      setThumbnailUrlSchema.parse(makeBody({ videoId: VIDEO_ID })),
    ).toThrow();
  });

  it('rejects an empty objectPath', () => {
    expect(() =>
      setThumbnailUrlSchema.parse(
        makeBody({ videoId: VIDEO_ID, objectPath: '' }),
      ),
    ).toThrow();
  });

  it('rejects a non-string objectPath', () => {
    expect(() =>
      setThumbnailUrlSchema.parse(
        makeBody({ videoId: VIDEO_ID, objectPath: 123 }),
      ),
    ).toThrow();
  });

  it('rejects a missing session user id', () => {
    const body = {
      body: {
        action: { name: 'setVideoThumbnailUrl' },
        input: { input: { videoId: VIDEO_ID, objectPath: OBJECT_PATH } },
        session_variables: {},
      },
    };
    expect(() => setThumbnailUrlSchema.parse(body)).toThrow();
  });
});
