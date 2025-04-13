interface ValidationResult {
  url: string;
  isValid: boolean;
}

interface DialogState {
  title: string;
  url: string;
  subtitle?: string;
  description?: string;
  playlistId?: string;
  newPlaylistName?: string;
  videoPositionInPlaylist?: number;
  isSubmitting: boolean;
  error: string | null;
  closeDialogCountdown: number | null;
}

export { type DialogState, type ValidationResult };
