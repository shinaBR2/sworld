import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { DialogComponent } from './dialog';
import { texts } from './texts';
import { DialogState } from './types';
import { CREATE_NEW_PLAYLIST } from './utils';

vi.mock('core/watch/query-hooks/playlists', () => ({
  useLoadPlaylists: vi.fn(() => ({
    playlists: [],
    isLoading: false,
    error: null,
  })),
}));

describe('DialogComponent', () => {
  // Mock props and handlers
  const mockHandleClose = vi.fn();
  const mockOnFormFieldChange = vi.fn(() => vi.fn());
  const mockHandleSubmit = vi.fn();
  const mockPlaylists = [
    { id: 'playlist1', title: 'Playlist 1', slug: 'playlist-1' },
    { id: 'playlist2', title: 'Playlist 2', slug: 'playlist-2' },
  ];

  // Initial dialog state
  const defaultState: DialogState = {
    isSubmitting: false,
    title: '',
    url: '',
    description: '',
    playlistId: '',
    newPlaylistName: '',
    videoPositionInPlaylist: 0,
    error: null,
    closeDialogCountdown: null,
  };

  // Helper function to render the component with specific state
  const renderComponent = (state: Partial<DialogState> = {}) => {
    return render(
      <DialogComponent
        state={{ ...defaultState, ...state }}
        open={true}
        handleClose={mockHandleClose}
        playlists={mockPlaylists}
        onFormFieldChange={mockOnFormFieldChange}
        handleSubmit={mockHandleSubmit}
      />
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // === RENDERING TESTS ===
  it('renders dialog with correct title', () => {
    renderComponent();
    expect(screen.getByText(texts.dialog.title)).toBeInTheDocument();
  });

  it('renders all form fields', () => {
    renderComponent();
    expect(screen.getByPlaceholderText(texts.form.titleInput.placeholder)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(texts.form.urlInput.placeholder)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(texts.form.descriptionInput.placeholder)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(texts.form.playlistInput.placeholder)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(texts.form.videoPositionInPlaylistInput.placeholder)).toBeInTheDocument();
  });

  it('renders playlists in dropdown', () => {
    renderComponent();
    // The combobox is CRUCIAL here
    const playlistField = screen.getByRole('combobox');
    fireEvent.mouseDown(playlistField);

    const options = screen.getByRole('listbox');

    const noneOption = within(options).getByText(texts.form.playlistInput.none);
    const createNewOption = within(options).getByText(texts.form.playlistInput.createNew);
    const playlist1Option = within(options).getByText('Playlist 1');
    const playlist2Option = within(options).getByText('Playlist 2');

    expect(noneOption).toBeInTheDocument();
    expect(createNewOption).toBeInTheDocument();
    expect(playlist1Option).toBeInTheDocument();
    expect(playlist2Option).toBeInTheDocument();

    fireEvent.click(playlist1Option);

    expect(mockOnFormFieldChange).toHaveBeenCalledWith('playlistId');
  });

  it('renders new playlist field when "Create New" is selected', () => {
    renderComponent({ playlistId: CREATE_NEW_PLAYLIST });
    expect(screen.getByLabelText(/new playlist name/i)).toBeInTheDocument();
  });

  // === INTERACTION TESTS ===
  it('calls onFormFieldChange when fields change', () => {
    renderComponent();
    fireEvent.change(screen.getByPlaceholderText(texts.form.titleInput.placeholder), {
      target: { value: 'New Title' },
    });
    expect(mockOnFormFieldChange).toHaveBeenCalledWith('title');
  });

  it('calls handleSubmit when submit button is clicked', () => {
    renderComponent();
    fireEvent.click(screen.getByRole('button', { name: texts.form.submitButton.submit }));
    expect(mockHandleSubmit).toHaveBeenCalled();
  });

  it('calls handleClose when close button is clicked', () => {
    renderComponent();
    fireEvent.click(screen.getByLabelText(texts.dialog.closeButton));
    expect(mockHandleClose).toHaveBeenCalled();
  });

  it('does not call handleClose when isSubmitting and close button is clicked', () => {
    renderComponent({ isSubmitting: true });
    fireEvent.click(screen.getByLabelText(texts.dialog.closeButton));
    expect(mockHandleClose).not.toHaveBeenCalled();
  });

  // === STATE-BASED BEHAVIOR TESTS ===
  it('disables all fields and buttons when isSubmitting is true', () => {
    renderComponent({ isSubmitting: true });
    expect(screen.getByPlaceholderText(texts.form.titleInput.placeholder)).toBeDisabled();
    expect(screen.getByPlaceholderText(texts.form.urlInput.placeholder)).toBeDisabled();
    expect(screen.getByPlaceholderText(texts.form.descriptionInput.placeholder)).toBeDisabled();
    expect(screen.getByPlaceholderText(texts.form.playlistInput.placeholder)).toBeDisabled();
    expect(screen.getByPlaceholderText(texts.form.videoPositionInPlaylistInput.placeholder)).toBeDisabled();
    expect(screen.getByRole('button', { name: texts.form.submitButton.submitting })).toBeDisabled();
    expect(screen.getByLabelText(texts.dialog.closeButton)).toBeDisabled();
  });

  it('displays error message when error state is set', () => {
    const errorMessage = 'Failed to upload video';
    renderComponent({ error: errorMessage });
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('displays success message with countdown when closeDialogCountdown is set', () => {
    renderComponent({ error: '', closeDialogCountdown: 5 });
    expect(screen.getByText(/successfully uploaded/i)).toBeInTheDocument();
    expect(screen.getByText(/dialog will close in 5 seconds/i)).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('shows validation error for new playlist name when required', () => {
    renderComponent({ playlistId: CREATE_NEW_PLAYLIST, newPlaylistName: '' });
    expect(screen.getByText(/playlist name is required/i)).toBeInTheDocument();
  });

  it('calls handleSubmit when retry button is clicked on error', () => {
    renderComponent({ error: 'Some error occurred' });
    fireEvent.click(screen.getByRole('button', { name: /retry/i }));
    expect(mockHandleSubmit).toHaveBeenCalled();
  });
});
