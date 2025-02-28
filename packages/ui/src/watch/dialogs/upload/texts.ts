export const texts = {
  dialog: {
    title: 'Upload Videos',
    closeButton: 'Close dialog',
  },
  form: {
    titleInput: {
      placeholder: 'Video title',
      label: 'Video title',
      helperText: 'short for the best visual',
    },
    urlInput: {
      placeholder: 'Enter video URL',
      label: 'Video URL',
      helperText: 'Can be either direct video url or platform like youtube url',
    },
    descriptionInput: {
      placeholder: 'Description for the video, optional',
      label: 'Video description',
      helperText: '',
    },
    playlistInput: {
      placeholder: 'Select a playlist (optional)',
      label: 'Playlist',
      none: 'None',
      createNew: '+ Create new playlist',
      helperText: 'Select your existing playlist',
    },
    newPlaylistNameInput: {
      placeholder: 'Short name for the playlist',
      label: 'Playlist name',
      helperText: 'short for the best visual',
    },
    videoPositionInPlaylistInput: {
      placeholder: 'Position in the playlsit (optional)',
      label: 'Position',
      helperText: 'order of videos in the playlist',
    },
    submitButton: {
      submit: 'Upload Videos',
      submitting: 'Uploading...',
    },
  },
  errors: {
    invalidUrl: '✗ Invalid video URL',
    failedToSave: 'Failed to upload',
    unexpected: 'An unexpected error occurred while upload',
  },
  validation: {
    valid: {
      status: '✓ Valid video URL',
      ariaLabel: 'Valid video URL',
    },
    invalid: {
      status: '✗ Invalid video URL',
      ariaLabel: 'Invalid video URL',
    },
  },
} as const;
