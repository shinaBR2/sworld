import { Provider, ErrorBoundary as RollbarErrorBoundary } from '@rollbar/react';
import { AppError } from './app-error';

interface ErrorBoundaryProps {
  config?: {
    accessToken: string;
    environment: string;
  };
  children: React.ReactNode;
  FallbackComponent: React.ComponentType<{
    errorMessage?: string;
    canRetry?: boolean;
  }>;
}

const ErrorBoundary = (props: ErrorBoundaryProps) => {
  const { children, config, FallbackComponent } = props;
  console.log(`config: ${JSON.stringify(config)}`);

  return (
    <Provider config={config}>
      <RollbarErrorBoundary
        fallbackUI={({ error }) => {
          if (error instanceof AppError) {
            return <FallbackComponent errorMessage={error.errorMessage} canRetry={error.canRetry} />;
          }

          return <FallbackComponent errorMessage="Something went wrong" canRetry={false} />;
        }}
      >
        {children}
      </RollbarErrorBoundary>
    </Provider>
  );
};

export { ErrorBoundary };
