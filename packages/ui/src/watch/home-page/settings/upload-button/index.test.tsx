/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { UploadButton } from './index';
import { Auth, watchQueryHooks } from 'core';

// Mock the core module
vi.mock('core', () => ({
  Auth: {
    useAuthContext: vi.fn(),
  },
  watchQueryHooks: {
    useFeatureFlag: vi.fn(),
  },
}));

describe('UploadButton', () => {
  const mockGetAccessToken = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementation for useAuthContext
    (Auth.useAuthContext as any).mockReturnValue({
      getAccessToken: mockGetAccessToken,
    });
  });

  it('should render loading state correctly', () => {
    // Mock the useFeatureFlag hook to return loading state
    (watchQueryHooks.useFeatureFlag as any).mockReturnValue({
      isLoading: true,
      enabled: false,
    });

    render(<UploadButton />);

    // Check if loading button is rendered
    const loadingButton = screen.getByRole('button', {
      name: /Upload button loading/i,
    });
    expect(loadingButton).toBeInTheDocument();
    expect(loadingButton).toHaveAttribute('aria-disabled', 'true');

    // Verify skeleton elements are present
    expect(
      screen.getByTestId('upload-button-skeleton-icon')
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('upload-button-skeleton-text')
    ).toBeInTheDocument();
  });

  it('should render enabled state correctly', () => {
    // Mock the useFeatureFlag hook to return enabled state
    (watchQueryHooks.useFeatureFlag as any).mockReturnValue({
      isLoading: false,
      enabled: true,
    });

    render(<UploadButton />);

    // Check if enabled button is rendered
    const button = screen.getByRole('button', { name: /Upload file/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-disabled', 'false');

    // Verify upload text and icon are present
    expect(screen.getByText('Upload')).toBeInTheDocument();
    expect(screen.getByTestId('CloudUploadIcon')).toBeInTheDocument();
  });

  it('should render disabled state correctly', () => {
    // Mock the useFeatureFlag hook to return disabled state
    (watchQueryHooks.useFeatureFlag as any).mockReturnValue({
      isLoading: false,
      enabled: false,
    });

    render(<UploadButton />);

    // Check if disabled button is rendered
    const button = screen.getByRole('button', { name: /Upload file/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-disabled', 'true');
  });

  it('should call useFeatureFlag with correct parameters', () => {
    // Mock the useFeatureFlag hook
    (watchQueryHooks.useFeatureFlag as any).mockReturnValue({
      isLoading: false,
      enabled: true,
    });

    render(<UploadButton />);

    // Verify useFeatureFlag was called with correct parameters
    expect(watchQueryHooks.useFeatureFlag).toHaveBeenCalledWith({
      name: 'upload',
      getAccessToken: mockGetAccessToken,
    });
  });
});
