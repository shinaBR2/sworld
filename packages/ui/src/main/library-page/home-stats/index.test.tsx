/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatsGrid } from './index';

const mockStats = {
  totalBooks: 12,
  completedBooks: 5,
  currentlyReading: 3,
  readingTimeThisMonth: 8,
  wishlist: 2,
};

describe('StatsGrid', () => {
  beforeEach(() => {
    // No mocks needed for simple rendering
  });

  it('should render loading skeleton state', () => {
    render(<StatsGrid isLoading={true} stats={null} />);
    expect(screen.getByLabelText('Stats section loading')).toBeInTheDocument();
    // Skeletons for each stat
    expect(screen.getByTestId('stats-value-skeleton-completedBooks')).toBeInTheDocument();
    expect(screen.getByTestId('stats-value-skeleton-currentlyReading')).toBeInTheDocument();
    expect(screen.getByTestId('stats-value-skeleton-readingTimeThisMonth')).toBeInTheDocument();
    expect(screen.getByTestId('stats-value-skeleton-wishlist')).toBeInTheDocument();
    expect(screen.getByTestId('stats-label-skeleton-completedBooks')).toBeInTheDocument();
    expect(screen.getByTestId('stats-label-skeleton-currentlyReading')).toBeInTheDocument();
    expect(screen.getByTestId('stats-label-skeleton-readingTimeThisMonth')).toBeInTheDocument();
    expect(screen.getByTestId('stats-label-skeleton-wishlist')).toBeInTheDocument();
  });

  it('should render all stat cards with correct values and labels', () => {
    render(<StatsGrid isLoading={false} stats={mockStats} />);
    // Completed Books
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('Books Completed')).toBeInTheDocument();
    // Currently Reading
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('Currently Reading')).toBeInTheDocument();
    // This Month (should include suffix 'h')
    expect(screen.getByText('8h')).toBeInTheDocument();
    expect(screen.getByText('This Month')).toBeInTheDocument();
    // Wishlist
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('Wishlist')).toBeInTheDocument();
  });

  it('should render 0 for missing stats', () => {
    render(<StatsGrid isLoading={false} stats={null} />);
    expect(screen.getAllByText('0').length).toBeGreaterThanOrEqual(3); // At least 3 zeros
    expect(screen.getByText('Books Completed')).toBeInTheDocument();
    expect(screen.getByText('Currently Reading')).toBeInTheDocument();
    expect(screen.getByText('This Month')).toBeInTheDocument();
    expect(screen.getByText('Wishlist')).toBeInTheDocument();
  });
});
