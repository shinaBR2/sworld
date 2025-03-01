import { Auth, Query } from 'core';
import { ErrorBoundary } from 'core';
import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import App from './App';
import { auth0Config, queryConfig, rollbarConfig, validateEnvVars } from './config';
import { ErrorFallback } from 'ui/universal/error-boundary';
import { MinimalismThemeProvider } from 'ui/listen/minimalism';

validateEnvVars();
// initSentry(sentryConfig);

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

/**
 * Put MinimalismThemeProvider under App component will cause the error:
 * Uncaught TypeError: createTheme_default is not a function
 */

root.render(
  <React.StrictMode>
    <ErrorBoundary config={rollbarConfig} FallbackComponent={ErrorFallback}>
      <Auth.AuthProvider config={auth0Config}>
        <Query.QueryProvider config={queryConfig}>
          <MinimalismThemeProvider>
            <App />
          </MinimalismThemeProvider>
        </Query.QueryProvider>
      </Auth.AuthProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
