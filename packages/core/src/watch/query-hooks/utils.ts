// Videos have no persisted "finished" flag — completion is derived from how
// close the saved progress is to the end. The 10s end-window matches the feel
// of the player's own resume-vs-restart threshold; it is the continue-watching
// domain's own constant, deliberately not code-coupled to the player package.
const VIDEO_FINISHED_END_THRESHOLD_SECONDS = 10;

// Shortest fraction of a clip that must be watched before it can count as
// finished. Guards short clips, where a flat 10s end-window would otherwise
// exceed (or dwarf) the runtime and flag a barely-watched clip as finished.
const VIDEO_FINISHED_MIN_WATCHED_RATIO = 0.9;

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

  // Cap the end-window at the clip's final 10% so "finished" always means "near
  // the actual end" regardless of length: a flat 10s window is right for a
  // feature-length movie but would flag a 20s clip as finished at its midpoint.
  const endThreshold = Math.min(
    VIDEO_FINISHED_END_THRESHOLD_SECONDS,
    duration * (1 - VIDEO_FINISHED_MIN_WATCHED_RATIO),
  );

  return progressSeconds >= duration - endThreshold;
};

export { VIDEO_FINISHED_END_THRESHOLD_SECONDS, isVideoFinished };
