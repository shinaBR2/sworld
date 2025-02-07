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
      placeholder: 'Can be either direct video url or platform like youtube url',
      label: 'Video URL',
      helperText: 'e.g., https://example.com/video1.mp4',
    },
    descriptionInput: {
      placeholder: 'Description for the video, optional',
      label: 'Video description',
      helperText: '',
    },
    submitButton: {
      default: 'Validate URLs',
      validating: 'Validating...',
      submit: 'Upload Videos',
      submitting: 'Uploading...',
    },
  },
  errors: {
    invalidUrl: '✗ Invalid video URL',
    failedToSave: 'Failed to upload',
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
