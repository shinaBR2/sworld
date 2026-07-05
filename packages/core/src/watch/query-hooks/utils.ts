// Videos have no persisted "finished" flag — completion is derived from how
// close the saved progress is to the end. Mirrors the player's
// RESUME_END_THRESHOLD_SECONDS (packages/ui/.../video-player) so the "continue
// watching" rows and the player agree on when a video counts as finished.
const VIDEO_FINISHED_END_THRESHOLD_SECONDS = 10;

interface IsVideoFinishedProps {
  progressSeconds: number;
  duration: number;
}

// A video is finished once progress reaches within the end threshold of its
// duration. When duration is unknown (0), we cannot judge completion — return
// false so we never wrongly hide an item.
const isVideoFinished = ({
  progressSeconds,
  duration,
}: IsVideoFinishedProps) => {
  if (duration <= 0) {
    return false;
  }

  return progressSeconds >= duration - VIDEO_FINISHED_END_THRESHOLD_SECONDS;
};

export { VIDEO_FINISHED_END_THRESHOLD_SECONDS, isVideoFinished };
