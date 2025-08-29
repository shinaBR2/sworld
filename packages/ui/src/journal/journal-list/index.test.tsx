import { fireEvent, render, screen } from '@testing-library/react';
import { formatDate, getMonthName } from 'core/universal/common';
import { describe, expect, it, vi } from 'vitest';
import { JournalList } from './index';

// Mock dependencies
vi.mock('core/universal/common', () => ({
  formatDate: vi.fn((date) => `formatted-date-${date}`),
  getMonthName: vi.fn((month) => `Month-${month}`),
}));

describe('JournalList', () => {
  const mockJournals = [
    {
      id: '1',
      date: '2023-05-15',
      content: 'Test content 1',
      mood: 'happy',
      tags: ['personal', 'work'],
      createdAt: '2023-05-15T10:00:00Z',
      updatedAt: '2023-05-15T10:00:00Z',
    },
  ];

  const mockStats = {
    categories: [
      { mood: 'happy', count: 5 },
      { mood: 'neutral', count: 3 },
      { mood: 'sad', count: 2 },
      { mood: 'total', count: 10 },
    ],
  };

  const defaultProps = {
    journals: mockJournals,
    stats: mockStats,
    isLoading: false,
    month: 5,
    year: 2023,
    onJournalClick: vi.fn(),
    onMonthChange: vi.fn(),
  };

  it('renders loading state correctly', () => {
    render(<JournalList {...defaultProps} isLoading={true} />);

    // Check for stat card skeletons
    const statSkeletons = screen.getAllByTestId(/^stat-skeleton-/);
    expect(statSkeletons).toHaveLength(4);

    // Check for journal card skeletons
    const journalSkeletons = screen.getAllByTestId(/^skeleton-/);
    expect(journalSkeletons).toHaveLength(3);
  });

  it('renders journal list with data correctly', () => {
    render(<JournalList {...defaultProps} />);

    // Check header
    expect(screen.getByText('Journals')).toBeInTheDocument();
    expect(
      screen.getByText(`Month-${defaultProps.month} ${defaultProps.year}`),
    ).toBeInTheDocument();

    // Check stat cards
    mockStats.categories.forEach((category) => {
      expect(screen.getByText(category.count.toString())).toBeInTheDocument();
    });

    // Check journal cards
    mockJournals.forEach((journal) => {
      expect(
        screen.getByText(`formatted-date-${journal.date}`),
      ).toBeInTheDocument();
      expect(screen.getByText(journal.content)).toBeInTheDocument();
      journal.tags.forEach((tag) => {
        expect(screen.getByText(tag)).toBeInTheDocument();
      });
    });
  });

  it('renders empty state when no journals', () => {
    render(<JournalList {...defaultProps} journals={[]} />);

    expect(
      screen.getByText('No journal entries for this month.'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Click the + button to create your first entry.'),
    ).toBeInTheDocument();
  });

  it('handles previous month navigation', () => {
    render(<JournalList {...defaultProps} />);

    const prevButton = screen
      .getByTestId('ArrowBackIosNewIcon')
      .closest('button');
    fireEvent.click(prevButton!);

    // April (4) 2023 when going back from May (5) 2023
    expect(defaultProps.onMonthChange).toHaveBeenCalledWith(4, 2023);
  });

  it('handles next month navigation', () => {
    render(<JournalList {...defaultProps} />);

    const nextButton = screen
      .getByTestId('ArrowForwardIosIcon')
      .closest('button');
    fireEvent.click(nextButton!);

    // June (6) 2023 when going forward from May (5) 2023
    expect(defaultProps.onMonthChange).toHaveBeenCalledWith(6, 2023);
  });

  it('handles year change when navigating months', () => {
    // Test December to January
    const { unmount: unmountFirst } = render(
      <JournalList {...defaultProps} month={12} year={2023} />,
    );
    const nextButton = screen
      .getByTestId('ArrowForwardIosIcon')
      .closest('button');
    fireEvent.click(nextButton!);
    expect(defaultProps.onMonthChange).toHaveBeenCalledWith(1, 2024);
    unmountFirst();

    // Test January to December
    const { unmount: unmountSecond } = render(
      <JournalList {...defaultProps} month={1} year={2023} />,
    );
    const prevButton = screen
      .getByTestId('ArrowBackIosNewIcon')
      .closest('button');
    fireEvent.click(prevButton!);
    expect(defaultProps.onMonthChange).toHaveBeenCalledWith(12, 2022);
    unmountSecond();
  });

  it('handles journal card click', () => {
    render(<JournalList {...defaultProps} />);

    const journalCard = screen
      .getByText(mockJournals[0].content)
      .closest('.MuiCard-root');
    fireEvent.click(journalCard!);

    expect(defaultProps.onJournalClick).toHaveBeenCalledWith(mockJournals[0]);
  });

  it('renders stat cards with correct colors and icons', () => {
    render(<JournalList {...defaultProps} />);

    // Check for mood icons using getAllByTestId since there might be multiple instances
    expect(screen.getAllByTestId('SentimentSatisfiedAltIcon')).not.toHaveLength(
      0,
    );
    expect(screen.getAllByTestId('SentimentNeutralIcon')).not.toHaveLength(0);
    expect(
      screen.getAllByTestId('SentimentVeryDissatisfiedIcon'),
    ).not.toHaveLength(0);
    expect(screen.getAllByTestId('CalendarTodayIcon')).not.toHaveLength(0);

    // Check for stat card labels
    expect(screen.getByText('Happy')).toBeInTheDocument();
    expect(screen.getByText('Neutral')).toBeInTheDocument();
    expect(screen.getByText('Sad')).toBeInTheDocument();
    expect(screen.getByText('Total')).toBeInTheDocument();
  });
});
