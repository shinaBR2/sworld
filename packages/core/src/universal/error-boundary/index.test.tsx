import { vi, describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { ErrorBoundary } from './index';
import { AppError } from './app-error';

// Mock the Rollbar Provider and ErrorBoundary
vi.mock('@rollbar/react', () => ({
  Provider: ({ children }) => children,
  ErrorBoundary: ({ children, fallbackUI }) => {
    // We'll use this to simulate errors in our tests
    if (children === 'TRIGGER_ERROR') {
      return fallbackUI({ error: new Error('Test error') });
    }
    if (children === 'TRIGGER_APP_ERROR') {
      return fallbackUI({ error: new AppError('technical message', 'Custom error message', true) });
    }
    return children;
  },
}));

describe('ErrorBoundary', () => {
  it('renders children when no error occurs', () => {
    const TestComponent = () => <div>Normal Content</div>;

    const { container } = render(
      <ErrorBoundary FallbackComponent={() => <div>Mocked Error Fallback</div>}>
        <TestComponent />
      </ErrorBoundary>
    );

    expect(container.textContent).toContain('Normal Content');
  });

  it('renders fallback with generic message for regular errors', () => {
    const TestFallback = ({ errorMessage, canRetry }) => (
      <div>
        <span>Error: {errorMessage}</span>
        <span>Retry: {canRetry ? 'Yes' : 'No'}</span>
      </div>
    );

    const { container } = render(
      <ErrorBoundary FallbackComponent={TestFallback} config={{ accessToken: 'test-token', environment: 'test' }}>
        TRIGGER_ERROR
      </ErrorBoundary>
    );

    expect(container.textContent).toContain('Error: Something went wrong');
    expect(container.textContent).toContain('Retry: No');
  });

  it('renders fallback with custom message for AppError', () => {
    const TestFallback = ({ errorMessage, canRetry }) => (
      <div>
        <span>Error: {errorMessage}</span>
        <span>Retry: {canRetry ? 'Yes' : 'No'}</span>
      </div>
    );

    const { container } = render(
      <ErrorBoundary FallbackComponent={TestFallback} config={{ accessToken: 'test-token', environment: 'test' }}>
        TRIGGER_APP_ERROR
      </ErrorBoundary>
    );

    expect(container.textContent).toContain('Error: Custom error message');
    expect(container.textContent).toContain('Retry: Yes');
  });
});
