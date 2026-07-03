import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { FeelingList } from './index';

describe('FeelingList', () => {
  const mockFeelings = [
    { id: '1', name: 'Happy' },
    { id: '2', name: 'Sad' },
  ];

  it('renders loading skeleton when loading', () => {
    render(
      <FeelingList
        activeId=""
        onSelect={() => {}}
        feelings={mockFeelings}
        isLoading
      />,
    );
    expect(screen.getByRole('status')).toHaveAttribute(
      'aria-label',
      'Loading feelings list',
    );
    expect(screen.getAllByRole('status')[0]).toBeInTheDocument();
  });

  it('renders chips with feelings', () => {
    render(
      <FeelingList
        activeId=""
        onSelect={() => {}}
        feelings={mockFeelings}
        isLoading={false}
      />,
    );

    expect(screen.getByText('Default')).toBeInTheDocument();
    expect(screen.getByText('Happy')).toBeInTheDocument();
    expect(screen.getByText('Sad')).toBeInTheDocument();
  });

  it('handles chip selection', () => {
    const onSelect = vi.fn();
    render(
      <FeelingList
        activeId=""
        onSelect={onSelect}
        feelings={mockFeelings}
        isLoading={false}
      />,
    );

    fireEvent.click(screen.getByText('Happy'));
    expect(onSelect).toHaveBeenCalledWith('1');
  });

  it('highlights active chip', () => {
    render(
      <FeelingList
        activeId="1"
        onSelect={() => {}}
        feelings={mockFeelings}
        isLoading={false}
      />,
    );

    expect(screen.getByRole('button', { name: 'Happy' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: 'Default' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });
});
