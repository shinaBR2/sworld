import { useCallback, useRef } from 'react';
import { gql } from 'graphql-request';
import { useMutationRequest } from '../../../universal/hooks/useMutation';

interface UpdateVideoProgressVars {
  videoId: string;
  progressSeconds: number;
  lastWatchedAt: string;
}

const UPDATE_VIDEO_PROGRESS = gql`
  mutation UpdateVideoProgress($videoId: uuid!, $progressSeconds: Int!, $lastWatchedAt: timestamptz!) {
    insert_user_video_history_one(
      object: { video_id: $videoId, progress_seconds: $progressSeconds, last_watched_at: $lastWatchedAt }
      on_conflict: {
        constraint: user_video_history_user_id_video_id_key
        update_columns: [progress_seconds, last_watched_at]
      }
    ) {
      id
      progress_seconds
      last_watched_at
    }
  }
`;

interface UseVideoProgressProps {
  videoId: string;
  getAccessToken: () => Promise<string>;
  onError?: (error: Error) => void;
}

const useVideoProgress = ({ videoId, getAccessToken, onError }: UseVideoProgressProps) => {
  const progressTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const { mutate } = useMutationRequest<unknown, UpdateVideoProgressVars>({
    document: UPDATE_VIDEO_PROGRESS,
    getAccessToken,
    options: {
      onError: (error: unknown) => {
        console.error('Failed to update video progress:', error);
        onError?.(error as Error);
      },
    },
  });

  const handleProgress = useCallback(
    ({ playedSeconds }: { playedSeconds: number }) => {
      // Clear any existing timeout
      if (progressTimeoutRef.current) {
        clearTimeout(progressTimeoutRef.current);
      }

      // Debounce progress updates to avoid too many mutations
      progressTimeoutRef.current = setTimeout(() => {
        mutate({
          videoId,
          progressSeconds: Math.floor(playedSeconds),
          lastWatchedAt: new Date().toISOString(),
        });
      }, 2000); // Update every 2 seconds of continuous playback
    },
    [videoId, mutate]
  );

  // Cleanup timeout on unmount
  const cleanup = useCallback(() => {
    if (progressTimeoutRef.current) {
      clearTimeout(progressTimeoutRef.current);
    }
  }, []);

  return {
    handleProgress,
    cleanup,
  };
};

export { useVideoProgress, type UseVideoProgressProps };
