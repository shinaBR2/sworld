// packages/ui/src/journal/journal-detail.test.tsx

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
  MoodIcon: vi.fn(() => null), // Mocking the MoodIcon component
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

    // Check for skeletons using MUI class
    const skeletons = document.getElementsByClassName('MuiSkeleton-root');
    expect(skeletons.length).toBeGreaterThan(0);

    // Back button should still be present during loading
    const backButton = screen.getByTestId('ArrowBackIcon').closest('button');
    expect(backButton).toBeInTheDocument();

    // Content should not be visible
    expect(screen.queryByText(mockJournal.content)).not.toBeInTheDocument();
  });

  it('should render "not found" state when journal is null', () => {
    renderComponent({ journal: null });

    expect(screen.getByText(/Journal entry not found/i)).toBeInTheDocument();

    // Back button should be present
    const backButton = screen.getByTestId('ArrowBackIcon').closest('button');
    expect(backButton).toBeInTheDocument();

    // Edit and delete buttons should not be present
    expect(screen.queryByTestId('EditIcon')).not.toBeInTheDocument();
    expect(screen.queryByTestId('DeleteOutlineIcon')).not.toBeInTheDocument();
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

    // Check tags
    mockJournal.tags.forEach((tag) => {
      expect(screen.getByText(tag)).toBeInTheDocument();
    });

    // Check timestamps
    expect(formatDateTime).toHaveBeenCalledWith(mockJournal.createdAt);
    expect(formatDateTime).toHaveBeenCalledWith(mockJournal.updatedAt);

    // Check for the combined text of label and formatted datetime
    expect(
      screen.getByText(
        (content) =>
          content.includes('Created:') &&
          content.includes(`formatted-datetime-${mockJournal.createdAt}`),
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        (content) =>
          content.includes('Updated:') &&
          content.includes(`formatted-datetime-${mockJournal.updatedAt}`),
      ),
    ).toBeInTheDocument();
  });

  it('should handle back button click', () => {
    renderComponent();

    const backButton = screen.getByTestId('ArrowBackIcon').closest('button');
    fireEvent.click(backButton!);

    expect(mockOnBackClick).toHaveBeenCalledTimes(1);
  });

  it('should handle edit button click', () => {
    renderComponent();

    // Using the EditIcon test ID since that's what's rendered
    const editButton = screen.getByTestId('EditIcon').closest('button');
    fireEvent.click(editButton!);

    expect(mockOnEditClick).toHaveBeenCalledTimes(1);
  });

  it('should handle delete button click', () => {
    renderComponent();

    // Using the DeleteOutlineIcon test ID since that's what's rendered
    const deleteButton = screen
      .getByTestId('DeleteOutlineIcon')
      .closest('button');
    fireEvent.click(deleteButton!);

    expect(mockOnDeleteClick).toHaveBeenCalledTimes(1);
  });

  it('should render MoodIcon with correct mood type', () => {
    renderComponent();

    // We're not directly testing the MoodIcon component,
    // but we can verify it receives the correct mood prop
    // by checking the component structure
    const actionButtons = screen.getAllByRole('button');

    // At least 3 buttons should be present (back, edit, delete)
    expect(actionButtons.length).toBeGreaterThanOrEqual(3);

    const mockMoodIcon = vi.mocked(MoodIcon);
    expect(mockMoodIcon).toHaveBeenCalledWith(
      expect.objectContaining({ mood: mockJournal.mood }),
      expect.anything(),
    );
  });
});
