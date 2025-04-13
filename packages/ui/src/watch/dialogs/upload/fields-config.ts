import { TextFieldVariants } from '@mui/material/TextField';
import { texts } from './texts';

const getFormFieldStaticConfigs = () => {
  return {
    title: {
      fullWidth: true,
      placeholder: texts.form.titleInput.placeholder,
      label: texts.form.titleInput.label,
      helperText: texts.form.titleInput.helperText,
      variant: 'outlined' as TextFieldVariants,
      sx: { mb: 2 },
      'aria-label': texts.form.titleInput.label,
      inputProps: { 'data-testid': 'title-input-text' },
      required: true,
    },
    url: {
      fullWidth: true,
      placeholder: texts.form.urlInput.placeholder,
      label: texts.form.urlInput.label,
      helperText: texts.form.urlInput.helperText,
      variant: 'outlined' as TextFieldVariants,
      sx: { mb: 2 },
      'aria-label': texts.form.urlInput.label,
      inputProps: { 'data-testid': 'url-input-text' },
      required: true,
    },
    subtitle: {
      fullWidth: true,
      placeholder: texts.form.subtitleInput.placeholder,
      label: texts.form.subtitleInput.label,
      helperText: texts.form.subtitleInput.helperText,
      variant: 'outlined' as TextFieldVariants,
      sx: { mb: 2 },
      'aria-label': texts.form.subtitleInput.label,
      inputProps: { 'data-testid': 'subtitle-input-text' },
      required: false,
    },
    description: {
      fullWidth: true,
      multiline: true,
      rows: 4,
      placeholder: texts.form.descriptionInput.placeholder,
      label: texts.form.descriptionInput.label,
      helperText: texts.form.descriptionInput.helperText,
      variant: 'outlined' as TextFieldVariants,
      sx: { mb: 2 },
      'aria-label': texts.form.descriptionInput.label,
      inputProps: { 'data-testid': 'description-input-textarea' },
    },
    playlist: {
      fullWidth: true,
      placeholder: texts.form.playlistInput.placeholder,
      label: texts.form.playlistInput.label,
      helperText: texts.form.playlistInput.helperText,
      variant: 'outlined' as TextFieldVariants,
      sx: { mb: 2 },
      'aria-label': texts.form.playlistInput.label,
      inputProps: { 'data-testid': 'playlist-input-select' },
    },
    newPlaylistName: {
      fullWidth: true,
      placeholder: texts.form.newPlaylistNameInput.placeholder,
      label: texts.form.newPlaylistNameInput.label,
      helperText: texts.form.newPlaylistNameInput.helperText,
      variant: 'outlined' as TextFieldVariants,
      sx: { mb: 2 },
      'aria-label': texts.form.newPlaylistNameInput.label,
      inputProps: { 'data-testid': 'new-playlist-name-input-text' },
    },
    videoPositionInPlaylist: {
      fullWidth: true,
      placeholder: texts.form.videoPositionInPlaylistInput.placeholder,
      label: texts.form.videoPositionInPlaylistInput.label,
      helperText: texts.form.videoPositionInPlaylistInput.helperText,
      variant: 'outlined' as TextFieldVariants,
      sx: { mb: 2 },
      'aria-label': texts.form.videoPositionInPlaylistInput.label,
      inputProps: { 'data-testid': 'video-position-in-playlist-input-number' },
    },
  };
};

export { getFormFieldStaticConfigs };
