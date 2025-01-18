import * as Sentry from '@sentry/react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  FallbackComponent: React.ReactElement;
}

const ErrorBoundary = (props: ErrorBoundaryProps) => {
  const { children, FallbackComponent } = props;

  return (
    <Sentry.ErrorBoundary fallback={FallbackComponent}>
      {children}
    </Sentry.ErrorBoundary>
  );
};

export { ErrorBoundary };
