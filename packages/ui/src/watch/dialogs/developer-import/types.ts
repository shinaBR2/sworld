interface ValidationResult {
  url: string;
  isValid: boolean;
}

interface DialogState {
  url: string;
  isSubmitting: boolean;
  error: string | null;
  closeDialogCountdown: number | null;
}

export { type ValidationResult, type DialogState };
