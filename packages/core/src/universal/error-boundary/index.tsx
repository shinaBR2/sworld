import * as Sentry from '@sentry/react';
import { AppError } from './app-error';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  FallbackComponent: React.ComponentType<{
    errorMessage?: string;
    canRetry?: boolean;
  }>;
}

const ErrorBoundary = (props: ErrorBoundaryProps) => {
  const { children, FallbackComponent } = props;

  return (
    <Sentry.ErrorBoundary
      fallback={({ error }) => {
        if (error instanceof AppError) {
          return <FallbackComponent errorMessage={error.errorMessage} canRetry={error.canRetry} />;
        }

        return <FallbackComponent errorMessage="Something went wrong" canRetry={false} />;
      }}
    >
      {children}
    </Sentry.ErrorBoundary>
  );
};

export { ErrorBoundary };
