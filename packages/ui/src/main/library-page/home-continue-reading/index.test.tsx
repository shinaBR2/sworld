/* eslint-disable @typescript-eslint/no-explicit-any */

import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ContinueReading } from './index';

// Mock Book data
const mockBook = {
  id: '1',
  title: 'Atomic Habits',
  author: 'James Clear',
  currentPage: 42,
  totalPages: 200,
  lastReadAt: '2025-06-30',
};

describe('ContinueReading', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading skeleton state', () => {
    render(<ContinueReading isLoading={true} />);

    // Title
    expect(screen.getByText('Continue Reading')).toBeInTheDocument();
    // Skeleton elements
    expect(screen.getByTestId('book-title-skeleton')).toBeInTheDocument();
    expect(screen.getByTestId('book-author-skeleton')).toBeInTheDocument();
    expect(screen.getByTestId('book-progress-skeleton')).toBeInTheDocument();
    expect(screen.getByTestId('book-pages-skeleton')).toBeInTheDocument();
    expect(screen.getByTestId('last-read-mobile-skeleton')).toBeInTheDocument();
    expect(screen.getByTestId('last-read-label-skeleton')).toBeInTheDocument();
    expect(screen.getByTestId('last-read-time-skeleton')).toBeInTheDocument();
  });

  it('should render empty state when no book', () => {
    render(<ContinueReading isLoading={false} book={undefined} />);
    expect(screen.getByText('Continue Reading')).toBeInTheDocument();
    expect(screen.getByText('No books in progress')).toBeInTheDocument();
    expect(
      screen.getByText('Start reading a book to see your progress here'),
    ).toBeInTheDocument();
  });

  it('should render book info and progress', () => {
    render(<ContinueReading isLoading={false} book={mockBook} />);
    expect(screen.getByText('Continue Reading')).toBeInTheDocument();
    expect(screen.getByText(mockBook.title)).toBeInTheDocument();
    expect(screen.getByText(`by ${mockBook.author}`)).toBeInTheDocument();
    expect(
      screen.getAllByText(
        (content, element) =>
          element?.tagName.toLowerCase() === 'p' &&
          content.includes('Last read'),
      ).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getByText(
        `Page ${mockBook.currentPage} of ${mockBook.totalPages}`,
      ),
    ).toBeInTheDocument();
  });

  it('should call onBookClick when card is clicked', () => {
    const handleBookClick = vi.fn();
    render(
      <ContinueReading
        isLoading={false}
        book={mockBook}
        onBookClick={handleBookClick}
      />,
    );
    // Find the Card by locating the book title, then get the closest Card element
    const card = screen.getByText(mockBook.title).closest('.MuiCard-root');
    expect(card).not.toBeNull();
    fireEvent.click(card!);
    expect(handleBookClick).toHaveBeenCalledWith(mockBook);
  });
});
