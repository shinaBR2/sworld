/* eslint-disable @typescript-eslint/no-explicit-any */

import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BooksGrid } from './index';

const mockBooks = [
  {
    id: '1',
    title: 'Atomic Habits',
    author: 'James Clear',
    progress: 20,
    isCompleted: false,
    isNew: true,
  },
  {
    id: '2',
    title: 'Deep Work',
    author: 'Cal Newport',
    progress: 100,
    isCompleted: true,
    isNew: false,
  },
];

describe('BooksGrid', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading skeleton state', () => {
    render(<BooksGrid isLoading={true} />);
    expect(screen.getByLabelText('Books library loading')).toBeInTheDocument();
    expect(screen.getByText('Your Library')).toBeInTheDocument();
    expect(screen.getByTestId('filter-skeleton')).toBeInTheDocument();
    expect(screen.getByTestId('grid-view-skeleton')).toBeInTheDocument();
    expect(screen.getByTestId('list-view-skeleton')).toBeInTheDocument();
    expect(screen.getAllByTestId('book-title-skeleton').length).toBeGreaterThan(
      0,
    );
    expect(
      screen.getAllByTestId('book-author-skeleton').length,
    ).toBeGreaterThan(0);
  });

  it('should render empty state when no books', () => {
    render(<BooksGrid isLoading={false} books={[]} />);
    expect(screen.getByText('Your Library')).toBeInTheDocument();
    expect(screen.getByText('No books in your library')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Add your first book to start building your personal library',
      ),
    ).toBeInTheDocument();
  });

  it('should render books grid', () => {
    render(<BooksGrid isLoading={false} books={mockBooks} />);
    expect(screen.getByText('Your Library')).toBeInTheDocument();
    // Book titles
    expect(screen.getByText('Atomic Habits')).toBeInTheDocument();
    expect(screen.getByText('Deep Work')).toBeInTheDocument();
    // Book authors
    expect(screen.getByText('James Clear')).toBeInTheDocument();
    expect(screen.getByText('Cal Newport')).toBeInTheDocument();
  });

  it('should call onBookClick when a BookCard is clicked', () => {
    const handleBookClick = vi.fn();
    render(
      <BooksGrid
        isLoading={false}
        books={mockBooks}
        onBookClick={handleBookClick}
      />,
    );
    // Simulate click on the book title text (BookCard attaches onClick to inner content)
    const firstBookTitle = screen.getByText('Atomic Habits');
    fireEvent.click(firstBookTitle);
    expect(handleBookClick).toHaveBeenCalledWith(mockBooks[0]);
  });

  it('should call onFilterChange when filter is changed', () => {
    const handleFilterChange = vi.fn();
    render(
      <BooksGrid
        isLoading={false}
        books={mockBooks}
        filter="all"
        onFilterChange={handleFilterChange}
      />,
    );
    // MUI Select uses role="combobox" for the select trigger
    const select = screen.getByRole('combobox');
    fireEvent.mouseDown(select);
    // The MenuItems appear as elements with text, not always with role 'option'. Use getByText.
    const completedOption = screen.getByText('Completed');
    fireEvent.click(completedOption);
    expect(handleFilterChange).toHaveBeenCalledWith('completed');
  });

  it('should call onLoadMore when Load More Books is clicked', () => {
    const handleLoadMore = vi.fn();
    render(
      <BooksGrid
        isLoading={false}
        books={mockBooks}
        hasMore={true}
        onLoadMore={handleLoadMore}
      />,
    );
    const loadMoreBtn = screen.getByRole('button', {
      name: /load more books/i,
    });
    fireEvent.click(loadMoreBtn);
    expect(handleLoadMore).toHaveBeenCalled();
  });
});
