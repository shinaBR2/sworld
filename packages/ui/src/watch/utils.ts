const formatCreatedDate = (
  date: string | null | undefined,
  locale: string = 'en-CA',
): string => {
  if (!date) {
    return '';
  }
  try {
    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) {
      throw new Error('Invalid date');
    }
    // Use UTC to avoid timezone shifts
    return parsedDate.toLocaleDateString(locale); // Returns YYYY-MM-DD
  } catch (error) {
    console.error(`Error formatting date: ${date}`, error);
    return '';
  }
};

interface MediaDisplayNameProps {
  videoTitle: string;
  playlistName?: string | null;
}

// Single source of truth for the name we show for a video everywhere in watch
// (continue-watching cards, the detail page, …). A video watched inside a
// playlist is prefixed with the playlist name — "Playlist - Video" — so the
// context is never lost; a standalone video is just its own title.
const getMediaDisplayName = (props: MediaDisplayNameProps): string => {
  const { videoTitle, playlistName } = props;

  return playlistName ? `${playlistName} - ${videoTitle}` : videoTitle;
};

// Formats a duration in seconds as `m:ss`, widening to `h:mm:ss` past an hour.
// Returns '' for missing / non-positive / non-finite values so callers can
// simply skip rendering the badge.
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

export { formatCreatedDate, formatDuration, getMediaDisplayName };
