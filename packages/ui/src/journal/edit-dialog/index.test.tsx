import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { EditDialog, EditDialogWithFetch } from './index';
import { Journal } from 'core/journal';
import { useLoadJournalById } from 'core/journal/query-hooks';

// Mock the hooks
vi.mock('core/journal/query-hooks', () => ({
  useLoadJournalById: vi.fn(),
}));

// Mock the JournalEdit component to simplify testing
vi.mock('../journal-edit', () => ({
  JournalEdit: vi.fn(({ journal, isLoading, isSaving, onBackClick, onSave }) => (
    <div data-testid="journal-edit">
      <div data-testid="journal-data">{JSON.stringify(journal)}</div>
      <div data-testid="loading-state">{String(isLoading)}</div>
      <div data-testid="saving-state">{String(isSaving)}</div>
      <button data-testid="back-button" onClick={onBackClick}>
        Back
      </button>
      <button data-testid="save-button" onClick={() => onSave({ id: 'test-id' } as Journal)}>
        Save
      </button>
    </div>
  )),
}));

describe('EditDialog', () => {
  const mockJournal: Journal = {
    id: '1',
    date: '2023-05-15',
    content: 'Test content',
    mood: 'happy',
    tags: ['test'],
    createdAt: '2023-05-15T10:00:00Z',
    updatedAt: '2023-05-15T10:00:00Z',
  };

  const defaultProps = {
    open: true,
    onClose: vi.fn(),
    selectedJournal: null,
    journalDetail: null,
    isLoadingDetail: false,
    createJournal: { isPending: false },
    updateJournal: { isPending: false },
    onSave: vi.fn(),
  };

  it('renders correctly when open', () => {
    render(<EditDialog {...defaultProps} />);

    expect(screen.getByTestId('journal-edit')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<EditDialog {...{ ...defaultProps, open: false }} />);

    expect(screen.queryByTestId('journal-edit')).not.toBeInTheDocument();
  });

  it('passes journalDetail to JournalEdit when available', () => {
    render(<EditDialog {...{ ...defaultProps, journalDetail: mockJournal }} />);

    const journalData = screen.getByTestId('journal-data');
    expect(journalData.textContent).toContain(mockJournal.id);
  });

  it('sets isLoading correctly when loading detail for selected journal', () => {
    render(<EditDialog {...{ ...defaultProps, selectedJournal: mockJournal, isLoadingDetail: true }} />);

    const loadingState = screen.getByTestId('loading-state');
    expect(loadingState.textContent).toBe('true');
  });

  it('sets isSaving when createJournal is pending', () => {
    render(<EditDialog {...{ ...defaultProps, createJournal: { isPending: true } }} />);

    const savingState = screen.getByTestId('saving-state');
    expect(savingState.textContent).toBe('true');
  });

  it('sets isSaving when updateJournal is pending', () => {
    render(<EditDialog {...{ ...defaultProps, updateJournal: { isPending: true } }} />);

    const savingState = screen.getByTestId('saving-state');
    expect(savingState.textContent).toBe('true');
  });

  it('calls onClose when back button is clicked', () => {
    const onClose = vi.fn();
    render(<EditDialog {...{ ...defaultProps, onClose }} />);

    screen.getByTestId('back-button').click();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onSave when save button is clicked', () => {
    const onSave = vi.fn();
    render(<EditDialog {...{ ...defaultProps, onSave }} />);

    screen.getByTestId('save-button').click();
    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith({ id: 'test-id' });
  });
});

describe('EditDialogWithFetch', () => {
  const mockJournal: Journal = {
    id: '1',
    date: '2023-05-15',
    content: 'Test content',
    mood: 'happy',
    tags: ['test'],
    createdAt: '2023-05-15T10:00:00Z',
    updatedAt: '2023-05-15T10:00:00Z',
  };

  const defaultFetchProps = {
    id: '1',
    getAccessToken: vi.fn().mockResolvedValue('test-token'),
    open: true,
    onClose: vi.fn(),
    createJournal: { isPending: false },
    updateJournal: { isPending: false },
    onSave: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with loading state', () => {
    vi.mocked(useLoadJournalById).mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    });

    render(<EditDialogWithFetch {...defaultFetchProps} />);

    expect(screen.getByTestId('loading-state').textContent).toBe('true');
  });

  it('renders with fetched journal data', () => {
    vi.mocked(useLoadJournalById).mockReturnValue({
      data: mockJournal,
      isLoading: false,
      error: null,
    });

    render(<EditDialogWithFetch {...defaultFetchProps} />);

    const journalData = screen.getByTestId('journal-data');
    expect(journalData.textContent).toContain(mockJournal.id);
    expect(screen.getByTestId('loading-state').textContent).toBe('false');
  });

  it('calls useLoadJournalById with correct props', () => {
    vi.mocked(useLoadJournalById).mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    });

    render(<EditDialogWithFetch {...defaultFetchProps} />);

    expect(useLoadJournalById).toHaveBeenCalledWith({
      getAccessToken: defaultFetchProps.getAccessToken,
      id: defaultFetchProps.id,
    });
  });

  it('handles null journal data', () => {
    vi.mocked(useLoadJournalById).mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    });

    render(<EditDialogWithFetch {...defaultFetchProps} />);

    const journalData = screen.getByTestId('journal-data');
    expect(journalData.textContent).toBe('null');
  });
});
