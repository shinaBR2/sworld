// Videos have no persisted "finished" flag, so the continue-watching row derives
// completion from how close the saved progress is to the end: a video within
// this many seconds of its end counts as finished and drops off the row. This is
// the row's own threshold — the player happens to use a similar end-window to
// choose resume-vs-restart, but the two are independent and need not match.
const VIDEO_FINISHED_END_THRESHOLD_SECONDS = 10;

interface IsVideoFinishedProps {
  progressSeconds: number;
  duration: number;
}

// A video is finished once its saved progress reaches within the end window of
// its duration. Clips whose whole runtime is within that window (or whose
// duration is unknown) are too short to judge by a fixed window — never treat
// them as finished, so a clip the viewer only just started is never hidden.
const isVideoFinished = ({
  progressSeconds,
  duration,
}: IsVideoFinishedProps) => {
  if (duration <= VIDEO_FINISHED_END_THRESHOLD_SECONDS) {
    return false;
  }

  return progressSeconds >= duration - VIDEO_FINISHED_END_THRESHOLD_SECONDS;
};

export { VIDEO_FINISHED_END_THRESHOLD_SECONDS, isVideoFinished };
