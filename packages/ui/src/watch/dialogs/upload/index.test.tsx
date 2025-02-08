/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/upload-dialog/index.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { VideoUploadDialog, CLOSE_DELAY_MS } from './index';
import hooks, { Auth, watchMutationHooks } from 'core';
import { canPlayUrls } from './utils';
import { texts } from './texts';

// Mock dependencies
vi.mock('core', () => ({
  default: {
    useCountdown: vi.fn(),
  },
  Auth: {
    useAuthContext: vi.fn(),
  },
  watchMutationHooks: {
    useBulkConvertVideos: vi.fn(),
  },
  commonHelpers: {
    slugify: (text: string) => text.toLowerCase(),
  },
}));

vi.mock('./utils', () => ({
  canPlayUrls: vi.fn(),
}));

const elements = {
  titleInput: () => screen.getByRole('textbox', { name: /title/i }),
  descriptionInput: () => screen.getByRole('textbox', { name: /description/i }),
  urlInput: () => screen.getByRole('textbox', { name: /url/i }),
  submitButton: () => screen.getByRole('button', { name: /upload videos|uploading\.\.\./i }),
  progressBar: () => screen.getByRole('progressbar'),
} as const;

describe('VideoUploadDialog', () => {
  const mockOnOpenChange = vi.fn();
  const mockGetAccessToken = vi.fn();
  const mockBulkConvert = vi.fn();
  const mockUseCountdown = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementations
    mockGetAccessToken.mockResolvedValue('mock-token');
    mockBulkConvert.mockResolvedValue({
      insert_videos: {
        returning: [{ id: '123', title: 'Test Video', description: 'Test Description' }],
      },
    });
    vi.mocked(canPlayUrls).mockResolvedValue([{ isValid: true }]);

    // Mock hooks
    (Auth.useAuthContext as any).mockReturnValue({
      getAccessToken: mockGetAccessToken,
    });
    (watchMutationHooks.useBulkConvertVideos as any).mockReturnValue({
      mutateAsync: mockBulkConvert,
    });
    (vi.mocked(hooks).useCountdown as any).mockImplementation(mockUseCountdown);
  });

  const fillForm = () => {
    fireEvent.change(elements.titleInput(), {
      target: { value: 'Test Video' },
    });
    fireEvent.change(elements.descriptionInput(), {
      target: { value: 'Test Description' },
    });
    fireEvent.change(elements.urlInput(), {
      target: { value: 'https://example.com/video' },
    });
  };

  it('should handle loading state correctly', async () => {
    mockBulkConvert.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(<VideoUploadDialog open={true} onOpenChange={mockOnOpenChange} />);

    fillForm();
    fireEvent.click(elements.submitButton());

    // Check loading state
    expect(elements.progressBar()).toBeInTheDocument();
    expect(elements.titleInput()).toBeDisabled();
    expect(elements.descriptionInput()).toBeDisabled();
    expect(elements.urlInput()).toBeDisabled();
    expect(elements.submitButton()).toBeDisabled();
    expect(elements.submitButton()).toHaveTextContent(/uploading\.\.\./i);

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
  });

  it('should handle invalid URL error', async () => {
    vi.mocked(canPlayUrls).mockResolvedValue([{ url: 'invalid-url', isValid: false }]);

    render(<VideoUploadDialog open={true} onOpenChange={mockOnOpenChange} />);

    fillForm();
    fireEvent.click(elements.submitButton());

    await waitFor(() => {
      expect(screen.getByText(texts.errors.invalidUrl)).toBeInTheDocument();
    });
    expect(mockBulkConvert).not.toHaveBeenCalled();
  });

  it('should handle submission error', async () => {
    mockBulkConvert.mockRejectedValue(new Error('Upload failed'));

    render(<VideoUploadDialog open={true} onOpenChange={mockOnOpenChange} />);

    fillForm();
    fireEvent.click(elements.submitButton());

    await waitFor(() => {
      expect(screen.getByText('Upload failed')).toBeInTheDocument();
    });
  });

  it('should handle successful submission with countdown', async () => {
    render(<VideoUploadDialog open={true} onOpenChange={mockOnOpenChange} />);

    fillForm();
    fireEvent.click(elements.submitButton());

    await waitFor(() => {
      expect(mockUseCountdown).toHaveBeenCalledWith(
        expect.objectContaining({
          duration: CLOSE_DELAY_MS / 1000,
          enabled: true,
        })
      );
    });

    // Verify API call
    expect(mockBulkConvert).toHaveBeenCalledWith({
      objects: [
        {
          title: 'Test Video',
          description: 'Test Description',
          slug: 'test video',
          video_url: 'https://example.com/video',
        },
      ],
    });
  });

  it('should handle unknown error from API', async () => {
    mockBulkConvert.mockResolvedValue({
      insert_videos: {
        returning: [], // Empty array simulates unknown error
      },
    });

    render(<VideoUploadDialog open={true} onOpenChange={mockOnOpenChange} />);

    fillForm();
    fireEvent.click(elements.submitButton());

    await waitFor(() => {
      expect(screen.getByText(texts.errors.failedToSave)).toBeInTheDocument();
    });
  });

  it('should clear error when URL is changed', () => {
    render(<VideoUploadDialog open={true} onOpenChange={mockOnOpenChange} />);

    // First trigger an error
    fillForm();
    vi.mocked(canPlayUrls).mockResolvedValueOnce([{ url: 'invalid-url', isValid: false }]);
    fireEvent.click(elements.submitButton());

    // Then change URL
    fireEvent.change(elements.urlInput(), {
      target: { value: 'https://example.com/new-video' },
    });

    expect(screen.queryByText(texts.errors.invalidUrl)).not.toBeInTheDocument();
  });
});
