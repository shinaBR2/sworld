import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { JournalEdit } from './index';

describe('JournalEdit', () => {
  const mockJournal = {
    id: '1',
    date: '2023-05-15',
    content: 'Test content',
    mood: 'happy',
    tags: ['test', 'journal'],
    createdAt: '2023-05-15T10:00:00Z',
    updatedAt: '2023-05-15T10:00:00Z',
  };

  const defaultProps = {
    journal: null,
    isLoading: false,
    isSaving: false,
    onBackClick: vi.fn(),
    onSave: vi.fn(),
  };

  it('renders loading state correctly', () => {
    render(<JournalEdit {...defaultProps} isLoading={true} />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.getByText('New Entry')).toBeInTheDocument();
  });

  it('renders new entry form correctly', () => {
    render(<JournalEdit {...defaultProps} />);

    expect(screen.getByText('New Entry')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("What's on your mind today?"),
    ).toBeInTheDocument();
  });

  it('renders edit form with journal data', () => {
    render(<JournalEdit {...defaultProps} journal={mockJournal} />);

    expect(screen.getByText('Edit Entry')).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockJournal.content)).toBeInTheDocument();
  });

  it('handles content changes', () => {
    render(<JournalEdit {...defaultProps} />);

    const contentInput = screen.getByPlaceholderText(
      "What's on your mind today?",
    );
    fireEvent.change(contentInput, { target: { value: 'New content' } });

    expect(contentInput).toHaveValue('New content');
  });

  it('handles mood selection', () => {
    render(<JournalEdit {...defaultProps} />);

    const sadButton = screen.getByRole('button', { name: /sad/i });
    const happyButton = screen.getByRole('button', { name: /happy/i });

    fireEvent.click(sadButton);
    expect(sadButton).toHaveClass('Mui-selected');

    fireEvent.click(happyButton);
    expect(happyButton).toHaveClass('Mui-selected');
    expect(sadButton).not.toHaveClass('Mui-selected');
  });

  it('preserves existing tags on save even though they are not editable', () => {
    const onSave = vi.fn();
    render(
      <JournalEdit {...defaultProps} journal={mockJournal} onSave={onSave} />,
    );

    fireEvent.click(screen.getByText('Save'));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ tags: mockJournal.tags }),
    );
  });

  it('handles save button click', () => {
    const onSave = vi.fn();
    render(<JournalEdit {...defaultProps} onSave={onSave} />);

    const contentInput = screen.getByPlaceholderText(
      "What's on your mind today?",
    );
    fireEvent.change(contentInput, { target: { value: 'New content' } });

    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        content: 'New content',
        mood: 'neutral',
        tags: [],
      }),
    );
  });

  it('disables save button when content is empty', () => {
    render(<JournalEdit {...defaultProps} />);

    const saveButton = screen.getByText('Save');
    expect(saveButton).toBeDisabled();

    const contentInput = screen.getByPlaceholderText(
      "What's on your mind today?",
    );
    fireEvent.change(contentInput, { target: { value: 'New content' } });
    expect(saveButton).not.toBeDisabled();
  });

  it('disables save button when saving is in progress', () => {
    render(<JournalEdit {...defaultProps} isSaving={true} />);

    const saveButton = screen.getByText('Saving...');
    expect(saveButton).toBeDisabled();
  });

  it('handles cancel button click', () => {
    const onBackClick = vi.fn();
    render(<JournalEdit {...defaultProps} onBackClick={onBackClick} />);

    fireEvent.click(screen.getByText('Cancel'));

    expect(onBackClick).toHaveBeenCalledTimes(1);
  });
});
