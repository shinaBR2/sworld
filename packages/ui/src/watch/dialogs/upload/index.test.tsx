interface CountdownMock extends ReturnType<typeof vi.fn> {
  onTick: ((remaining: number) => void) | null;
  onComplete: (() => void) | null;
}

const mockValidateForm = vi.hoisted(() => vi.fn());
const mockCanPlayUrls = vi.hoisted(() => vi.fn());
const mockUseBulkConvertVideos = vi.hoisted(() => {
  // Store the latest onSuccess callback
  let successCallback: ((data: any) => void) | undefined;

  const mock = vi.fn().mockImplementation(options => {
    // Capture the onSuccess callback when the hook is called
    successCallback = options?.onSuccess;

    // Return a mutateAsync that will call the success callback
    const mutateAsync = vi.fn().mockImplementation(async variables => {
      const result = {
        insert_videos: {
          returning: [{ id: '123', title: 'Test Video' }],
        },
      };

      // Simulate async operation
      await new Promise(resolve => setTimeout(resolve, 10));

      // Call the success callback if it exists
      if (successCallback) {
        successCallback(result);
      }

      return result;
    });

    return { mutateAsync };
  });

  // Add a property to expose the success callback for testing
  mock.getSuccessCallback = () => successCallback;

  return mock;
});
const mockInvalidateQuery = vi.hoisted(() => vi.fn());
const mockUseCountdown = vi.hoisted(() => {
  const mock = vi.fn() as CountdownMock;
  // Add properties to store callbacks for later use in tests
  mock.onComplete = null;
  mock.onTick = null;
  return mock;
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { Videos_Insert_Input } from 'core/graphql/graphql';
import { VideoUploadDialog } from './index';
import { CLOSE_DELAY_MS } from './utils';
import { texts } from './texts';
import { validateForm } from './validate';

// Mock dependencies
vi.mock('./utils', () => ({
  CLOSE_DELAY_MS: 2000,
  CREATE_NEW_PLAYLIST: 'tmp-id',
  buildVariables: vi.fn().mockImplementation((state): { objects: Array<Videos_Insert_Input> } => {
    const videoObject: Videos_Insert_Input = {
      title: state.title,
      description: state.description,
      slug: state.title.toLowerCase(),
      video_url: state.url,
    };

    const variables = {
      objects: [videoObject],
    };

    if (state.playlistId) {
      videoObject.playlist_videos = {
        data: [
          {
            playlist_id: state.playlistId,
            position: state.videoPositionInPlaylist || 0,
          },
        ],
      };
    }

    return variables;
  }),
  canPlayUrls: mockCanPlayUrls,
}));

vi.mock('./validate', () => ({
  validateForm: mockValidateForm,
}));

// Mock hooks from core
vi.mock('core/providers/auth', () => ({
  useAuthContext: vi.fn().mockReturnValue({
    getAccessToken: vi.fn().mockResolvedValue('mock-token'),
  }),
}));

vi.mock('core/providers/query', () => ({
  useQueryContext: vi.fn().mockReturnValue({
    invalidateQuery: mockInvalidateQuery,
  }),
}));

vi.mock('core/watch/mutation-hooks/bulk-convert', () => ({
  useBulkConvertVideos: mockUseBulkConvertVideos,
}));

vi.mock('core/universal/hooks/useCooldown', () => ({
  useCountdown: mockUseCountdown,
}));

vi.mock('core/watch/query-hooks/playlists', () => ({
  useLoadPlaylists: vi.fn().mockReturnValue({
    playlists: [],
    isLoading: false,
    error: null,
  }),
}));

// Mock DialogComponent to simplify testing
vi.mock('./dialog', () => ({
  DialogComponent: vi.fn(({ open, state, onFormFieldChange, handleSubmit }) => (
    <div data-testid="dialog" data-open={open}>
      <form onSubmit={handleSubmit}>
        <input data-testid="title-input" onChange={onFormFieldChange('title')} disabled={state.isSubmitting} />
        <input data-testid="url-input" onChange={onFormFieldChange('url')} disabled={state.isSubmitting} />
        <input
          data-testid="description-input"
          onChange={onFormFieldChange('description')}
          disabled={state.isSubmitting}
        />
        <select
          data-testid="playlist-select"
          onChange={onFormFieldChange('playlistId')}
          value={state.playlistId}
          disabled={state.isSubmitting}
        >
          <option value="">No playlist</option>
          <option value="playlist-1">Playlist 1</option>
        </select>
        <input
          type="checkbox"
          data-testid="keep-original-source"
          checked={state.keepOriginalSource}
          onChange={e => onFormFieldChange('keepOriginalSource')({ target: { value: e.target.checked } })}
          disabled={state.isSubmitting}
        />
        <input
          type="checkbox"
          data-testid="keep-dialog-open"
          checked={state.keepDialogOpen}
          onChange={e => onFormFieldChange('keepDialogOpen')({ target: { value: e.target.checked } })}
          disabled={state.isSubmitting}
        />
        <button type="submit" data-testid="submit-button" disabled={state.isSubmitting}>
          {state.isSubmitting ? 'Importing...' : 'Import Video'}
        </button>
        {state.error && <div data-testid="error-message">{state.error}</div>}
        {state.closeDialogCountdown && !state.keepDialogOpen && (
          <div data-testid="countdown">Closing in {state.closeDialogCountdown}s</div>
        )}
      </form>
    </div>
  )),
}));

const renderWithAct = async (component: React.ReactElement) => {
  await act(async () => {
    render(component);
  });
};

describe('VideoUploadDialog', () => {
  const mockOnOpenChange = vi.fn();
  let mockBulkConvert: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup mock implementation for validateForm
    mockValidateForm.mockImplementation(() => null);
    mockCanPlayUrls.mockResolvedValue([{ url: 'https://example.com/video.mp4', isValid: true }]);

    // Setup mock implementation for bulk convert
    mockBulkConvert = vi.fn().mockImplementation(async (variables: { objects: Array<Videos_Insert_Input> }) => {
      const result = {
        insert_videos: {
          returning: [{ id: '123', title: 'Test Video' }],
        },
      };
      return result;
    });
    mockUseBulkConvertVideos.mockImplementation(options => {
      return {
        mutateAsync: async (variables: { objects: Array<Videos_Insert_Input> }) => {
          const result = await mockBulkConvert(variables);
          // Call the onSuccess callback with the result and variables
          if (options?.onSuccess) {
            options.onSuccess(result, variables);
          }
          return result;
        },
      };
    });

    // Setup mock implementation for countdown
    mockUseCountdown.mockImplementation(({ onComplete, onTick, enabled }) => {
      // Store callbacks for manual triggering in tests
      mockUseCountdown.onComplete = onComplete;
      mockUseCountdown.onTick = onTick;
      return { enabled };
    });
  });

  const fillForm = async () => {
    await waitFor(() => {
      // Make sure elements are available
      expect(screen.getByTestId('title-input')).toBeInTheDocument();
      expect(screen.getByTestId('url-input')).toBeInTheDocument();
      expect(screen.getByTestId('description-input')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByTestId('title-input'), {
      target: { value: 'Test Video' },
    });
    fireEvent.change(screen.getByTestId('url-input'), {
      target: { value: 'https://example.com/video.mp4' },
    });
    fireEvent.change(screen.getByTestId('description-input'), {
      target: { value: 'Test Description' },
    });
  };

  it('should render when open is true', async () => {
    renderWithAct(<VideoUploadDialog open={true} onOpenChange={mockOnOpenChange} />);
    await waitFor(() => {
      expect(screen.getByTestId('dialog')).toHaveAttribute('data-open', 'true');
    });
  });

  it('should update form fields on change', async () => {
    renderWithAct(<VideoUploadDialog open={true} onOpenChange={mockOnOpenChange} />);

    await fillForm();

    await act(async () => {
      fireEvent.submit(screen.getByTestId('submit-button'));
    });

    expect(mockValidateForm).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Test Video',
        url: 'https://example.com/video.mp4',
        description: 'Test Description',
      })
    );
  });

  it('should handle form validation errors', async () => {
    mockValidateForm.mockReturnValue(texts.errors.invalidUrl);

    renderWithAct(<VideoUploadDialog open={true} onOpenChange={mockOnOpenChange} />);

    await fillForm();
    fireEvent.submit(screen.getByTestId('submit-button'));

    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent(texts.errors.invalidUrl);
    });

    expect(mockBulkConvert).not.toHaveBeenCalled();
  });

  it('should handle successful submission', async () => {
    renderWithAct(<VideoUploadDialog open={true} onOpenChange={mockOnOpenChange} />);

    await fillForm();
    fireEvent.submit(screen.getByTestId('submit-button'));

    await waitFor(() => {
      expect(mockBulkConvert).toHaveBeenCalledWith({
        objects: [
          {
            title: 'Test Video',
            description: 'Test Description',
            slug: 'test video',
            video_url: 'https://example.com/video.mp4',
          },
        ],
      });
    });

    // Check countdown is started
    expect(mockUseCountdown).toHaveBeenCalledWith(
      expect.objectContaining({
        duration: CLOSE_DELAY_MS / 1000,
        enabled: true,
      })
    );

    // Simulate countdown completion
    if (mockUseCountdown.onComplete) {
      mockUseCountdown.onComplete();
    }

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it('should show loading state during submission', async () => {
    // Make the bulk convert call take some time
    mockBulkConvert.mockImplementation(
      () =>
        new Promise(resolve =>
          setTimeout(() => {
            resolve({
              insert_videos: {
                returning: [{ id: '123', title: 'Test Video' }],
              },
            });
          }, 100)
        )
    );

    renderWithAct(<VideoUploadDialog open={true} onOpenChange={mockOnOpenChange} />);

    await fillForm();
    fireEvent.submit(screen.getByTestId('submit-button'));

    // Check loading state
    expect(screen.getByTestId('submit-button')).toBeDisabled();
    expect(screen.getByTestId('submit-button')).toHaveTextContent(`${texts.form.submitButton.submitting}`);
    expect(screen.getByTestId('title-input')).toBeDisabled();
    expect(screen.getByTestId('url-input')).toBeDisabled();
    expect(screen.getByTestId('description-input')).toBeDisabled();

    await waitFor(() => {
      expect(mockBulkConvert).toHaveBeenCalled();
    });
  });

  it('should handle API errors', async () => {
    mockBulkConvert.mockRejectedValue(new Error('Network error'));

    renderWithAct(<VideoUploadDialog open={true} onOpenChange={mockOnOpenChange} />);

    await fillForm();
    fireEvent.submit(screen.getByTestId('submit-button'));

    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent('Network error');
    });

    // Fields should be re-enabled
    expect(screen.getByTestId('submit-button')).not.toBeDisabled();
    expect(screen.getByTestId('title-input')).not.toBeDisabled();
  });

  it('should handle unexpected API response', async () => {
    mockBulkConvert.mockResolvedValue({
      insert_videos: {
        returning: [],
      },
    });

    // Update useBulkConvertVideos mock to pass the correct data structure
    mockUseBulkConvertVideos.mockImplementation(options => ({
      mutateAsync: async (variables: { objects: Array<Videos_Insert_Input> }) => {
        const result = await mockBulkConvert(variables);
        if (options?.onSuccess) {
          options.onSuccess(result, variables);
        }
        return result;
      },
    }));

    renderWithAct(<VideoUploadDialog open={true} onOpenChange={mockOnOpenChange} />);

    await fillForm();
    fireEvent.submit(screen.getByTestId('submit-button'));

    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent(texts.errors.failedToSave);
    });
  });

  it('should clear errors when form fields change', async () => {
    vi.mocked(validateForm).mockReturnValue(texts.errors.invalidUrl);

    renderWithAct(<VideoUploadDialog open={true} onOpenChange={mockOnOpenChange} />);

    await fillForm();
    fireEvent.submit(screen.getByTestId('submit-button'));

    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toBeInTheDocument();
    });

    // Change a field
    fireEvent.change(screen.getByTestId('url-input'), {
      target: { value: 'https://example.com/better-video.mp4' },
    });

    // Error should be cleared
    expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
  });

  it('should show countdown timer after successful submission', async () => {
    renderWithAct(<VideoUploadDialog open={true} onOpenChange={mockOnOpenChange} />);

    await fillForm();
    fireEvent.submit(screen.getByTestId('submit-button'));

    await waitFor(() => {
      expect(mockBulkConvert).toHaveBeenCalled();
    });

    await waitFor(() => {
      // Simulate countdown ticking
      if (mockUseCountdown.onTick) {
        mockUseCountdown.onTick(CLOSE_DELAY_MS / 1000);
      }
    });

    expect(screen.getByTestId('countdown')).toHaveTextContent('Closing in 2s');
  });

  it('should invalidate videos cache on successful submission', async () => {
    renderWithAct(<VideoUploadDialog open={true} onOpenChange={mockOnOpenChange} />);

    await fillForm();

    // Submit the form
    await act(async () => {
      fireEvent.submit(screen.getByTestId('submit-button'));
    });

    // Wait for the mutation and invalidation to complete
    await waitFor(() => {
      expect(mockBulkConvert).toHaveBeenCalled();
    });

    // Now check if invalidateQuery was called with the right arguments
    expect(mockInvalidateQuery).toHaveBeenCalledWith(['videos']);
  });

  it('should invalidate playlist-detail cache when a playlist is selected', async () => {
    renderWithAct(<VideoUploadDialog open={true} onOpenChange={mockOnOpenChange} />);

    await fillForm();

    // Select a playlist
    await act(async () => {
      fireEvent.change(screen.getByTestId('playlist-select'), {
        target: { value: 'playlist-1' },
      });
    });

    // Submit the form
    await act(async () => {
      fireEvent.submit(screen.getByTestId('submit-button'));
    });

    // Wait for the mutation and invalidation to complete
    await waitFor(() => {
      expect(mockBulkConvert).toHaveBeenCalled();
    });

    // Now check if both invalidateQuery calls were made with the right arguments
    expect(mockInvalidateQuery).toHaveBeenCalledWith(['videos']);
    expect(mockInvalidateQuery).toHaveBeenCalledWith(['playlist-detail', 'playlist-1']);
  });

  it('should not invalidate playlist-detail cache when no playlist is selected', async () => {
    renderWithAct(<VideoUploadDialog open={true} onOpenChange={mockOnOpenChange} />);

    await fillForm();

    // Submit the form
    await act(async () => {
      fireEvent.submit(screen.getByTestId('submit-button'));
    });

    // Wait for the mutation and invalidation to complete
    await waitFor(() => {
      expect(mockBulkConvert).toHaveBeenCalled();
    });

    // Now check if invalidateQuery was called with the right arguments
    expect(mockInvalidateQuery).toHaveBeenCalledWith(['videos']);

    // And make sure it wasn't called with playlist-detail
    const playlistDetailCalls = mockInvalidateQuery.mock.calls.filter(
      call => call[0] && call[0][0] === 'playlist-detail'
    );
    expect(playlistDetailCalls.length).toBe(0);
  });
});
