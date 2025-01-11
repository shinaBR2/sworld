export const texts = {
  dialog: {
    title: 'Upload Videos',
    closeButton: 'Close dialog',
  },
  form: {
    urlInput: {
      placeholder: 'Paste video URLs, separated by commas',
      label: 'Video URLs',
      helperText:
        'e.g., https://example.com/video1.mp4, https://example.com/video2.mp4',
    },
    submitButton: {
      default: 'Validate URLs',
      validating: 'Validating...',
      submit: 'Upload Videos',
      submitting: 'Uploading...',
    },
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
