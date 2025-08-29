import { AppError } from './app-error';

const createNetworkError = (error: Error) =>
  new AppError(
    error.message,
    'Unable to connect to our servers. Please check your internet connection and try again.',
    true,
  );

const createTimeoutError = (error: Error) =>
  new AppError(
    error.message,
    'The request took too long to complete. Please try again.',
    true,
  );

// Authentication/Authorization errors
const createAuthenticationError = (error: Error) =>
  new AppError(error.message, 'Please try to sign in again.', false);

const createSessionExpiredError = (error: Error) =>
  new AppError(
    error.message,
    'Your session has expired. Please sign in again.',
    false,
  );

const createPermissionError = (error: Error) =>
  new AppError(
    error.message,
    "You don't have permission to perform this action.",
    false,
  );

// Data errors
const createDataLoadError = (error: Error) =>
  new AppError(
    error.message,
    'Failed to load the required data. Please try again.',
    true,
  );

const createDataSubmitError = (error: Error) =>
  new AppError(
    error.message,
    'Failed to save your changes. Please try again.',
    true,
  );

const createInvalidDataError = (error: Error) =>
  new AppError(
    error.message,
    'The data you provided is invalid. Please check and try again.',
    true,
  );

// Resource errors
const createResourceNotFoundError = (error: Error) =>
  new AppError(
    error.message,
    'The requested resource could not be found.',
    false,
  );

const createResourceUnavailableError = (error: Error) =>
  new AppError(
    error.message,
    'This feature is temporarily unavailable. Please try again later.',
    true,
  );

// Rate limiting
const createRateLimitError = (error: Error) =>
  new AppError(
    error.message,
    "You've made too many requests. Please wait a moment and try again.",
    true,
  );

const createConnectionError = (error: Error) =>
  new AppError(
    error.message,
    'Failed to establish connection. Please try again.',
    true,
  );

export {
  createNetworkError,
  createTimeoutError,
  createAuthenticationError,
  createSessionExpiredError,
  createPermissionError,
  createDataLoadError,
  createDataSubmitError,
  createInvalidDataError,
  createResourceNotFoundError,
  createResourceUnavailableError,
  createRateLimitError,
  createConnectionError,
};
