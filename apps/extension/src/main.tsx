import { AuthProvider } from 'core/providers/auth';
import { QueryProvider } from 'core/providers/query';
import { ErrorBoundary } from 'core/universal/error-boundary';
import React, { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { ErrorFallback } from 'ui/universal/error-boundary';
import {
  auth0Config,
  extensionId,
  hasuraConfig,
  rollbarConfig,
} from '../envConfig';
import Popup from './popup';

const queryConfig = {
  hasuraUrl: hasuraConfig.url,
};

const Wrapper = () => {
  return (
    <StrictMode>
      <ErrorBoundary config={rollbarConfig} FallbackComponent={ErrorFallback}>
        <AuthProvider config={auth0Config} extensionId={extensionId}>
          <QueryProvider config={queryConfig}>
            <Popup />
          </QueryProvider>
        </AuthProvider>
      </ErrorBoundary>
    </StrictMode>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(<Wrapper />);
