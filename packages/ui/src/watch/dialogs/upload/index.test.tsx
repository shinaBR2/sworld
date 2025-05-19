interface CountdownMock extends ReturnType<typeof vi.fn> {
  onTick: ((remaining: number) => void) | null;
  onComplete: (() => void) | null;
}

const mockValidateForm = vi.hoisted(() => vi.fn());
const mockCanPlayUrls = vi.hoisted(() => vi.fn());
const mockUseBulkConvertVideos = vi.hoisted(() => vi.fn());
const mockUseCountdown = vi.hoisted(() => {
  const mock = vi.fn() as CountdownMock;
  // Add properties to store callbacks for later use in tests
  mock.onComplete = null;
  mock.onTick = null;
  return mock;
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { VideoUploadDialog } from './index';
import { CLOSE_DELAY_MS } from './utils';
import { texts } from './texts';
import { validateForm } from './validate';

// Mock dependencies
vi.mock('./utils', () => ({
  CLOSE_DELAY_MS: 2000,
  CREATE_NEW_PLAYLIST: 'tmp-id',
  buildVariables: vi.fn().mockImplementation(state => ({
    objects: [
      {
        title: state.title,
        description: state.description,
        slug: state.title.toLowerCase(),
        video_url: state.url,
      },
    ],
  })),
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
    mockBulkConvert = vi.fn().mockResolvedValue({
      insert_videos: {
        returning: [{ id: '123', title: 'Test Video' }],
      },
    });
    mockUseBulkConvertVideos.mockReturnValue({
      mutateAsync: mockBulkConvert,
    });

    // Setup mock implementation for countdown
    mockUseCountdown.mockImplementation(({ onComplete, onTick }) => {
      // Store callbacks for manual triggering in tests
      mockUseCountdown.onComplete = onComplete;
      mockUseCountdown.onTick = onTick;
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
        returning: [], // Empty array - unexpected response
      },
    });

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
});
