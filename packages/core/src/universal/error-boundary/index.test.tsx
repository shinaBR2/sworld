import {
  describe,
  it,
  expect,
  vi,
  beforeAll,
  afterAll,
  beforeEach,
} from 'vitest';
import { ErrorBoundary } from './index';
import { render } from '@testing-library/react';
import sentryTestkit from 'sentry-testkit';
import * as Sentry from '@sentry/react';

const { testkit, sentryTransport } = sentryTestkit();

// Mock the fallback component
vi.mock('@sworld/ui/ErrorFallback', () => ({
  default: vi.fn(() => <div>Mocked Error Fallback</div>),
}));

describe('ErrorBoundary', () => {
  const originalConsoleError = console.error;

  beforeAll(() => {
    console.error = vi.fn();

    Sentry.init({
      dsn: 'https://test@sentry.io/test',
      transport: sentryTransport,
      // Disable sending actual events during test
      enabled: false,
    });
  });

  afterAll(() => {
    console.error = originalConsoleError;
  });

  beforeEach(() => {
    testkit.reset();
  });

  it('renders children when no error occurs', () => {
    const TestComponent = () => <div>Normal Content</div>;

    const { container } = render(
      <ErrorBoundary FallbackComponent={<div>Mocked Error Fallback</div>}>
        <TestComponent />
      </ErrorBoundary>
    );

    expect(container.textContent).toContain('Normal Content');
  });

  it('renders fallback component when an error is thrown', () => {
    const ErrorThrowingComponent = () => {
      throw new Error('Test Error');
    };

    // Ensure no previous reports
    expect(testkit.reports()).toHaveLength(0);

    const { container } = render(
      <ErrorBoundary FallbackComponent={<div>Mocked Error Fallback</div>}>
        <ErrorThrowingComponent />
      </ErrorBoundary>
    );

    expect(container.textContent).toContain('Mocked Error Fallback');
  });
});
