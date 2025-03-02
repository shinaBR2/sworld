import { AppError } from '../error-boundary/app-error';
import { useRollbar } from '@rollbar/react';

interface ErrorTag {
  key: string;
  value: string | number | boolean;
}

interface CaptureErrorOptions {
  tags?: ErrorTag[];
  extras?: Record<string, unknown>;
  fingerprint?: string[];
}

const useTracker = () => {
  const rollbar = useRollbar();

  const captureError = (error: AppError, options: CaptureErrorOptions = {}) => {
    const { tags = [], extras = {}, fingerprint = ['{{ default }}'] } = options;
    rollbar.error(error.errorMessage, error, {
      tags,
      extras,
      fingerprint,
    });
  };

  return { captureError };
};

export { useTracker };
