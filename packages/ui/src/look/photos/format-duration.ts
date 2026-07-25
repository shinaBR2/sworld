// Formats a video's length in seconds as a compact badge label: `m:ss`, or
// `h:mm:ss` once it passes an hour. Returns '' for missing / non-positive /
// non-finite values so callers can simply skip rendering the badge (an image
// has no duration).
const formatDuration = (seconds: number | null | undefined): string => {
  if (!seconds || seconds <= 0 || !Number.isFinite(seconds)) {
    return '';
  }

  const total = Math.floor(seconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  const pad = (value: number) => String(value).padStart(2, '0');

  return hours > 0
    ? `${hours}:${pad(minutes)}:${pad(secs)}`
    : `${minutes}:${pad(secs)}`;
};

export { formatDuration };
