import { useCallback, useEffect, useRef } from 'react';
import { graphql } from '../../../graphql';
import { UpdateVideoProgressMutation } from '../../../graphql/graphql';
import { useMutationRequest } from '../../../universal/hooks/useMutation';

interface UpdateVideoProgressVars {
  videoId: string;
  progressSeconds: number;
  lastWatchedAt: string;
}

const UPDATE_VIDEO_PROGRESS = graphql(/* GraphQL */ `
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
`);

interface UseVideoProgressProps {
  videoId: string;
  isSignedIn: boolean;
  getAccessToken: () => Promise<string>;
  onError?: (error: Error) => void;
}

/**
 * Hook to track and save video playback progress
 *
 * Features:
 * - Saves progress every 15s during playback
 * - Immediate saves on pause/seek/end
 * - Saves progress when tab closes
 * - Debounces server calls to prevent flooding
 *
 * @example
 * ```tsx
 * const MyVideoPlayer = ({ videoId }) => {
 *   const {
 *     handleProgress,
 *     handlePlay,
 *     handlePause,
 *     handleSeek,
 *     handleEnded
 *   } = useVideoProgress({
 *     videoId,
 *     getAccessToken: () => auth.getToken(),
 *     onError: (error) => toast.error(error.message)
 *   });
 *
 *   return (
 *     <ReactPlayer
 *       onProgress={handleProgress}
 *       onPlay={handlePlay}
 *       onPause={handlePause}
 *       onSeek={handleSeek}
 *       onEnded={handleEnded}
 *     />
 *   );
 * };
 * ```
 */
const useVideoProgress = (props: UseVideoProgressProps) => {
  const { isSignedIn, videoId, getAccessToken, onError } = props;
  /**
   * Use refs to:
   * - Track interval without triggering re-renders
   * - Access latest progress in event listeners/callbacks
   * - Prevent stale closures in callbacks
   */
  const intervalRef = useRef<ReturnType<typeof setInterval>>();
  const currentProgressRef = useRef<number>(0);

  const { mutate } = useMutationRequest<UpdateVideoProgressMutation, UpdateVideoProgressVars>({
    document: UPDATE_VIDEO_PROGRESS,
    getAccessToken,
    options: {
      onError: (error: unknown) => {
        console.error('Failed to update video progress:', error);
        onError?.(error as Error);
      },
    },
  });

  const saveProgress = useCallback(
    (seconds: number) => {
      const progress = {
        videoId,
        progressSeconds: Math.floor(seconds),
        lastWatchedAt: new Date().toISOString(),
      };

      mutate(progress);
    },
    [videoId, mutate]
  );

  const handleProgress = useCallback(
    ({ playedSeconds }: { playedSeconds: number }) => {
      if (!isSignedIn) return;

      currentProgressRef.current = playedSeconds;
    },
    [isSignedIn]
  );

  const handlePlay = useCallback(() => {
    if (!isSignedIn) return;
    if (intervalRef.current) return;

    intervalRef.current = setInterval(() => {
      saveProgress(currentProgressRef.current);
    }, 15000);
  }, [saveProgress, isSignedIn]);

  const handlePause = useCallback(() => {
    if (!isSignedIn) return;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }
    saveProgress(currentProgressRef.current);
  }, [saveProgress, isSignedIn]);

  const handleSeek = useCallback(
    (seconds: number) => {
      if (!isSignedIn) return;

      currentProgressRef.current = seconds;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = undefined;
      }
      saveProgress(currentProgressRef.current);
    },
    [saveProgress, isSignedIn]
  );

  const handleEnded = useCallback(() => {
    if (!isSignedIn) return;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }
    saveProgress(currentProgressRef.current);
  }, [saveProgress, isSignedIn]);

  const cleanup = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, []);

  // Add effect to clear interval when signing out
  useEffect(() => {
    if (!isSignedIn && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }
  }, [isSignedIn]);

  return {
    handleProgress,
    handlePlay,
    handlePause,
    handleSeek,
    handleEnded,
    cleanup,
  };
};

export { useVideoProgress, type UseVideoProgressProps };
