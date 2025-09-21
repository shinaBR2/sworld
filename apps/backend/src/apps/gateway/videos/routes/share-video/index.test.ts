import { describe, it, vi, expect, beforeEach } from 'vitest';
import { AppError, AppResponse } from 'src/utils/schema';
import { VIDEO_ERRORS } from 'src/utils/error-codes';
import { verifySignature } from 'src/services/videos/convert/validator';
import * as CustomErrorModule from 'src/utils/custom-error';
import { getUsers } from 'src/services/hasura/queries/share';
import { shareVideo } from 'src/services/hasura/mutations/share-videos';
import { shareVideoHandler } from './index';

vi.mock('src/utils/envConfig', () => ({
  envConfig: {
    computeServiceUrl: 'http://compute',
    ioServiceUrl: 'http://io',
  },
}));

vi.mock('src/services/videos/convert/validator', () => ({
  verifySignature: vi.fn(),
}));

vi.mock('src/services/hasura/queries/share', () => ({
  getUsers: vi.fn(),
}));

vi.mock('src/services/hasura/mutations/share-videos', () => ({
  shareVideo: vi.fn(),
}));

describe('shareVideoHandler', () => {
  let mockValidatedData: any;
  const mockJson = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(CustomErrorModule.CustomError, 'critical');
    mockValidatedData = {
      validatedData: {
        signatureHeader: 'valid-signature',
        event: {
          data: {
            id: 'video-1',
            sharedRecipientsInput: ['user1@example.com', 'user2@example.com'],
          },
          metadata: {
            id: 'event-1',
          },
        },
      },
    };
  });

  it('should return error if no valid emails are provided', async () => {
    mockValidatedData.validatedData.event.data.sharedRecipientsInput = [
      'invalid-email',
    ];

    const result = await shareVideoHandler(mockValidatedData);

    expect(result).toEqual(
      AppError('Invalid email', {
        eventId: 'event-1',
      }),
    );
  });

  it('should return error if no valid users found', async () => {
    vi.mocked(getUsers).mockResolvedValue({
      users: null,
    });

    const result = await shareVideoHandler(mockValidatedData);

    expect(result).toEqual(
      AppError('No valid users found', {
        eventId: 'event-1',
      }),
    );
  });

  it('should throw CustomError when shareVideo fails', async () => {
    vi.mocked(getUsers).mockResolvedValue({
      users: [{ id: 'user-1', email: 'user1@example.com' }],
    });

    const mockError = new Error('Database error');
    vi.mocked(shareVideo).mockRejectedValue(mockError);

    await expect(shareVideoHandler(mockValidatedData)).rejects.toThrow(
      'Video share failed',
    );

    expect(CustomErrorModule.CustomError.critical).toHaveBeenCalledWith(
      'Video share failed',
      expect.objectContaining({
        errorCode: VIDEO_ERRORS.SHARE_FAILED,
        originalError: mockError,
        context: {
          data: mockValidatedData.validatedData.event.data,
          metadata: mockValidatedData.validatedData.event.metadata,
        },
        source: 'apps/gateway/videos/routes/share-video/index.ts',
      }),
    );
  });

  it('should successfully share video with valid users', async () => {
    vi.mocked(getUsers).mockResolvedValue({
      users: [
        { id: 'user-1', email: 'user1@example.com' },
        { id: 'user-2', email: 'user2@example.com' },
      ],
    });
    vi.mocked(shareVideo).mockResolvedValue({
      insert_shared_video_recipients: {
        returning: [{ id: 'record-1' }, { id: 'record-2' }],
      },
      update_videos_by_pk: {
        id: 'video-1',
        sharedRecipients: ['user1@example.com', 'user2@example.com'],
      },
    });

    const result = await shareVideoHandler(mockValidatedData);

    expect(shareVideo).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          videoId: 'video-1',
          recipientId: expect.any(String),
        }),
      ]),
      'video-1',
      ['user1@example.com', 'user2@example.com'],
    );
    expect(result).toEqual(AppResponse(true, 'ok'));
  });
});
