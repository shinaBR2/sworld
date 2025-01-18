import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorFallback } from '.';

// Mock the texts import
vi.mock('./texts', () => ({
  texts: {
    title: 'Something went wrong',
    message: 'An unexpected error occurred',
    tryAgain: 'Try again',
  },
}));

describe('ErrorFallback', () => {
  let reloadMock: ReturnType<typeof vi.fn>;
  const originalLocation = window.location;

  beforeEach(() => {
    // Mock console.error to prevent unnecessary error output during testing
    vi.spyOn(console, 'error').mockImplementation(() => {});

    // Create a reload mock
    reloadMock = vi.fn();

    // Override window.location with mock
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...originalLocation, reload: reloadMock },
    });
  });

  afterEach(() => {
    // Restore all mocks after each test
    vi.restoreAllMocks();

    // Restore original window.location
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation,
    });
  });

  it('renders the error UI with default props', () => {
    render(<ErrorFallback />);

    // Check for default title and message
    expect(screen.getByText('Something went wrong')).toBeTruthy();
    expect(screen.getByText('An unexpected error occurred')).toBeTruthy();

    // Check for retry button
    const tryAgainButton = screen.getByText('Try again');
    expect(tryAgainButton).toBeTruthy();
  });

  it('renders with custom error message', () => {
    const customMessage = 'Custom error occurred';
    render(<ErrorFallback errorMessage={customMessage} />);

    expect(screen.getByText(customMessage)).toBeTruthy();
  });

  it('triggers page reload when retry button is clicked', () => {
    render(<ErrorFallback />);

    const tryAgainButton = screen.getByText('Try again');
    fireEvent.click(tryAgainButton);

    expect(reloadMock).toHaveBeenCalledTimes(1);
  });

  it('hides retry button when canRetry is false', () => {
    render(<ErrorFallback canRetry={false} />);

    const tryAgainButton = screen.queryByText('Try again');
    expect(tryAgainButton).toBeNull();
  });
});
