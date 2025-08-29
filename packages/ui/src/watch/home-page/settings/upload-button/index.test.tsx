/* eslint-disable @typescript-eslint/no-explicit-any */

import { render, screen } from '@testing-library/react';
import { Auth, Query } from 'core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UploadButton } from './index';

// Mock the core module
vi.mock('core', () => ({
  Auth: {
    useAuthContext: vi.fn(),
  },
  Query: {
    useQueryContext: vi.fn(),
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
    (Query.useQueryContext as any).mockReturnValue({
      featureFlags: {
        isLoading: true,
        data: null,
      },
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
      screen.getByTestId('upload-button-skeleton-icon'),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('upload-button-skeleton-text'),
    ).toBeInTheDocument();
  });

  it('should render enabled state correctly', () => {
    (Query.useQueryContext as any).mockReturnValue({
      featureFlags: {
        isLoading: false,
        data: {
          upload: true,
        },
      },
    });

    render(<UploadButton />);

    // Check if enabled button is rendered
    const button = screen.getByRole('button', { name: /Upload file/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-disabled', 'false');

    // Verify upload text and icon are present
    expect(screen.getByText('Import')).toBeInTheDocument();
    expect(screen.getByTestId('CloudUploadIcon')).toBeInTheDocument();
  });

  it('should render disabled state correctly', () => {
    (Query.useQueryContext as any).mockReturnValue({
      featureFlags: {
        isLoading: false,
        data: {
          upload: false,
        },
      },
    });

    render(<UploadButton />);

    // Check if disabled button is rendered
    const button = screen.getByRole('button', { name: /Upload file/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-disabled', 'true');
  });
});
