class AppError extends Error {
  constructor(
    // technical error message
    message: string,
    // user-friendly error message
    public readonly errorMessage: string,
    public readonly canRetry: boolean,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export { AppError };
