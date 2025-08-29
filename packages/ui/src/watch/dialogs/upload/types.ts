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
  keepOriginalSource?: boolean;
  isSubmitting: boolean;
  error: string | null;
  closeDialogCountdown: number | null;
  keepDialogOpen?: boolean;
}

export type { DialogState, ValidationResult };
