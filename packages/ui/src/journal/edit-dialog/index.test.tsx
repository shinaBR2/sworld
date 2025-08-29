import { fireEvent, render, screen } from '@testing-library/react';
import type { Journal } from 'core/journal';
import { describe, expect, it, vi } from 'vitest';
import { EditDialog } from './index';

// Mock the JournalEdit component to simplify testing
vi.mock('../journal-edit', () => ({
  JournalEdit: vi.fn(
    ({ journal, isLoading, isSaving, onBackClick, onSave }) => (
      <div data-testid="journal-edit">
        <div data-testid="journal-data">{JSON.stringify(journal)}</div>
        <div data-testid="loading-state">{String(isLoading)}</div>
        <div data-testid="saving-state">{String(isSaving)}</div>
        <button data-testid="back-button" onClick={onBackClick}>
          Back
        </button>
        <button
          data-testid="save-button"
          onClick={() => onSave({ id: 'test-id' } as Journal)}
        >
          Save
        </button>
      </div>
    ),
  ),
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

    // With keepMounted, content stays in the DOM but should not be visible
    const content = screen.getByTestId('journal-edit');
    expect(content).toBeInTheDocument();
    expect(content).not.toBeVisible();
  });

  it('passes journalDetail to JournalEdit when available', () => {
    render(<EditDialog {...{ ...defaultProps, journalDetail: mockJournal }} />);

    const journalData = screen.getByTestId('journal-data');
    expect(journalData.textContent).toContain(mockJournal.id);
  });

  it('sets isLoading correctly when isLoadingDetail is true', () => {
    render(<EditDialog {...{ ...defaultProps, isLoadingDetail: true }} />);

    const loadingState = screen.getByTestId('loading-state');
    expect(loadingState.textContent).toBe('true');
  });

  it('sets isSaving when createJournal is pending', () => {
    render(
      <EditDialog
        {...{ ...defaultProps, createJournal: { isPending: true } }}
      />,
    );

    const savingState = screen.getByTestId('saving-state');
    expect(savingState.textContent).toBe('true');
  });

  it('sets isSaving when updateJournal is pending', () => {
    render(
      <EditDialog
        {...{ ...defaultProps, updateJournal: { isPending: true } }}
      />,
    );

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

  it('does not call onClose on escape key press', () => {
    const onClose = vi.fn();
    render(<EditDialog {...{ ...defaultProps, onClose }} />);

    const dialog = screen.getByRole('dialog');
    dialog.focus(); // Focus the dialog to ensure it receives the key event

    fireEvent.keyDown(dialog, { key: 'Escape' });
    expect(onClose).not.toHaveBeenCalled();
  });

  it('does not call onClose on backdrop click', () => {
    const onClose = vi.fn();
    render(<EditDialog {...{ ...defaultProps, onClose }} />);

    // The backdrop is rendered at the document root by MUI
    const backdrop = document.querySelector('.MuiBackdrop-root');
    expect(backdrop).toBeInTheDocument();

    if (backdrop) {
      fireEvent.click(backdrop);
    }

    expect(onClose).not.toHaveBeenCalled();
  });
});
