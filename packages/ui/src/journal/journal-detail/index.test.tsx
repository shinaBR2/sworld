// packages/ui/src/journal/journal-detail/index.test.tsx

import { fireEvent, render, screen } from '@testing-library/react';
import { formatDate, formatDateTime } from 'core/universal/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MoodIcon } from '../mood-icons';
import { JournalDetail } from './index';

// Mock dependencies
vi.mock('core/universal/common', () => ({
  formatDate: vi.fn((date) => `formatted-date-${date}`),
  formatDateTime: vi.fn((date) => `formatted-datetime-${date}`),
}));

vi.mock('../mood-icons', () => ({
  MoodIcon: vi.fn(() => null),
  MOOD_CONFIG: {
    happy: { label: 'Happy', color: 'success' },
    neutral: { label: 'Neutral', color: 'info' },
    sad: { label: 'Sad', color: 'error' },
  },
}));

// Constants for testing
const mockJournal = {
  id: '123',
  date: '2025-04-15',
  content: 'This is a test journal entry content',
  mood: 'happy',
  tags: ['personal', 'reflection'],
  createdAt: '2025-04-15T12:00:00Z',
  updatedAt: '2025-04-15T14:30:00Z',
};

describe('JournalDetail', () => {
  const mockOnBackClick = vi.fn();
  const mockOnEditClick = vi.fn();
  const mockOnDeleteClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = (props = {}) => {
    return render(
      <JournalDetail
        journal={mockJournal}
        isLoading={false}
        onBackClick={mockOnBackClick}
        onEditClick={mockOnEditClick}
        onDeleteClick={mockOnDeleteClick}
        {...props}
      />,
    );
  };

  it('should render loading skeleton when isLoading is true', () => {
    renderComponent({ isLoading: true });

    const skeletons = document.getElementsByClassName('MuiSkeleton-root');
    expect(skeletons.length).toBeGreaterThan(0);

    const backButton = screen.getByTestId('ArrowBackIcon').closest('button');
    expect(backButton).toBeInTheDocument();

    expect(screen.queryByText(mockJournal.content)).not.toBeInTheDocument();
  });

  it('should render "not found" state when journal is null', () => {
    renderComponent({ journal: null });

    expect(screen.getByText(/Journal entry not found/i)).toBeInTheDocument();

    const backButton = screen.getByTestId('ArrowBackIcon').closest('button');
    expect(backButton).toBeInTheDocument();

    // Actions menu should not be present in the not-found state
    expect(screen.queryByTestId('MoreVertIcon')).not.toBeInTheDocument();
  });

  it('should render journal details correctly', () => {
    renderComponent();

    // Check date formatting
    expect(formatDate).toHaveBeenCalledWith(mockJournal.date);
    expect(
      screen.getByText(`formatted-date-${mockJournal.date}`),
    ).toBeInTheDocument();

    // Check content
    expect(screen.getByText(mockJournal.content)).toBeInTheDocument();

    // Mood label chip
    expect(screen.getByText('Happy')).toBeInTheDocument();

    // Check tags
    mockJournal.tags.forEach((tag) => {
      expect(screen.getByText(tag)).toBeInTheDocument();
    });

    // Timestamp collapses to a single "Edited" line when updatedAt differs
    expect(formatDateTime).toHaveBeenCalledWith(mockJournal.updatedAt);
    expect(
      screen.getByText(
        (content) =>
          content.includes('Edited') &&
          content.includes(`formatted-datetime-${mockJournal.updatedAt}`),
      ),
    ).toBeInTheDocument();
  });

  it('should show the created timestamp when the entry was never edited', () => {
    renderComponent({
      journal: { ...mockJournal, updatedAt: mockJournal.createdAt },
    });

    expect(
      screen.getByText(`formatted-datetime-${mockJournal.createdAt}`),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Edited/)).not.toBeInTheDocument();
  });

  it('should handle back button click', () => {
    renderComponent();

    const backButton = screen.getByTestId('ArrowBackIcon').closest('button');
    fireEvent.click(backButton!);

    expect(mockOnBackClick).toHaveBeenCalledTimes(1);
  });

  it('should edit via the actions menu', () => {
    renderComponent();

    fireEvent.click(screen.getByLabelText('entry actions'));
    fireEvent.click(screen.getByText('Edit'));

    expect(mockOnEditClick).toHaveBeenCalledTimes(1);
  });

  it('should delete via the actions menu', () => {
    renderComponent();

    fireEvent.click(screen.getByLabelText('entry actions'));
    fireEvent.click(screen.getByText('Delete'));

    expect(mockOnDeleteClick).toHaveBeenCalledTimes(1);
  });

  it('should render MoodIcon with correct mood type', () => {
    renderComponent();

    const mockMoodIcon = vi.mocked(MoodIcon);
    expect(mockMoodIcon).toHaveBeenCalledWith(
      expect.objectContaining({ mood: mockJournal.mood }),
      undefined,
    );
  });
});
