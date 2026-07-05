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

  // Cap the threshold at half the duration so a clip shorter than the fixed
  // end-threshold isn't flagged as finished the instant it starts (for an 8s
  // clip a flat 10s threshold would make `duration - threshold` negative, so
  // any progress would count as finished).
  const endThreshold = Math.min(
    VIDEO_FINISHED_END_THRESHOLD_SECONDS,
    duration / 2,
  );

  return progressSeconds >= duration - endThreshold;
};

export { VIDEO_FINISHED_END_THRESHOLD_SECONDS, isVideoFinished };
