/* eslint-disable @typescript-eslint/no-explicit-any */

import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BookCard } from './index';

const baseBook = {
  id: '1',
  title: 'Atomic Habits',
  author: 'James Clear',
};

describe('BookCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render book title and author', () => {
    render(<BookCard book={baseBook} />);
    expect(screen.getByText(baseBook.title)).toBeInTheDocument();
    expect(screen.getByText(baseBook.author)).toBeInTheDocument();
  });

  it('should call onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<BookCard book={baseBook} onClick={handleClick} />);
    fireEvent.click(screen.getByText(baseBook.title));
    expect(handleClick).toHaveBeenCalledWith(baseBook);
  });

  it('should show the "New" badge if isNew', () => {
    render(<BookCard book={{ ...baseBook, isNew: true }} />);
    expect(screen.getByText('New')).toBeInTheDocument();
  });

  it('should show the "100%" badge if isCompleted', () => {
    render(<BookCard book={{ ...baseBook, isCompleted: true }} />);
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('should show the progress bar if progress > 0 and not completed', () => {
    // Add data-testid to the progress bar in BookCard for robust testing
    render(<BookCard book={{ ...baseBook, progress: 55 }} />);
    // Find the progress bar by test id
    const progressBar = screen.queryByTestId('book-progress-bar');
    expect(progressBar).toBeInTheDocument();
  });

  it('should not show the progress bar if completed', () => {
    render(
      <BookCard book={{ ...baseBook, progress: 100, isCompleted: true }} />,
    );
    // Should not find a bar with width 100% if completed
    const progressBar = screen
      .getByText(baseBook.title)
      .closest('.MuiBox-root')
      ?.parentElement?.querySelector('[style*="width: 100%"]');
    expect(progressBar).toBeNull();
    // But should show the 100% badge
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('should show the Play icon overlay', () => {
    render(<BookCard book={baseBook} />);
    expect(screen.getByTestId('PlayArrowIcon')).toBeInTheDocument();
  });
});
