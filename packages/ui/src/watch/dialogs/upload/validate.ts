import { texts } from './texts';
import { DialogState } from './types';
import { canPlayUrls, CREATE_NEW_PLAYLIST, formalizeState } from './utils';

const validateForm = (state: DialogState) => {
  const { title, url, subtitle, playlistId, newPlaylistName } = formalizeState(state);

  if (!title.trim()) {
    return texts.errors.emptyTitle;
  }

  if (playlistId == CREATE_NEW_PLAYLIST && !newPlaylistName?.trim()) {
    return texts.errors.emptyNewPlaylistName;
  }

  const validationResults = canPlayUrls([url.trim()]);
  const isValid = validationResults.length === 1 && validationResults[0].isValid;

  if (!isValid) {
    return texts.errors.invalidUrl;
  }

  // Validate subtitle URL if provided
  if (subtitle?.trim()) {
    const isValidSubtitle = subtitle.trim().toLowerCase().endsWith('.vtt');
    if (!isValidSubtitle) {
      return texts.errors.invalidSubtitleFormat;
    }
  }

  return null;
};

export { validateForm };
