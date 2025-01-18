class AppError extends Error {
  constructor(
    message: string,
    public readonly errorMessage: string,
    public readonly canRetry: boolean
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export { AppError };
