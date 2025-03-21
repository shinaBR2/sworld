import { texts } from './texts';
import { DialogState } from './types';
import { canPlayUrls, CREATE_NEW_PLAYLIST, formalizeState } from './utils';

const validateForm = async (state: DialogState) => {
  const { title, url, playlistId, newPlaylistName } = formalizeState(state);

  if (!title.trim()) {
    return texts.errors.emptyTitle;
  }

  if (playlistId == CREATE_NEW_PLAYLIST && !newPlaylistName?.trim()) {
    return texts.errors.emptyNewPlaylistName;
  }

  const validationResults = await canPlayUrls([url.trim()]);
  const isValid = validationResults.length === 1 && validationResults[0].isValid;

  if (!isValid) {
    return texts.errors.invalidUrl;
  }

  return null;
};

export { validateForm };
