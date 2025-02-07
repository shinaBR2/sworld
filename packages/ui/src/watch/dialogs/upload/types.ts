interface ValidationResult {
  url: string;
  isValid: boolean;
}

interface DialogState {
  title: string;
  url: string;
  description?: string;
  isSubmitting: boolean;
  error: string | null;
  closeDialogCountdown: number | null;
}

export { type ValidationResult, type DialogState };
