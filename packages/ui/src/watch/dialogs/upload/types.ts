import { watchMutationHooks } from 'core';

interface ValidationResult {
  url: string;
  isValid: boolean;
}

interface DialogState {
  title: string;
  urls: string;
  description?: string;
  validating: boolean;
  results: ValidationResult[];
  error: string | null;
  success: watchMutationHooks.BulkConvertResponse | null;
  closeDialogCountdown: number;
}

export { type ValidationResult, type DialogState };
