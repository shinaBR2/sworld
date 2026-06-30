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

export { formatCreatedDate, getMediaDisplayName };
