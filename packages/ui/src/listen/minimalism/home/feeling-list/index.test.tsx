import { render, fireEvent, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { FeelingList } from './index';

describe('FeelingList', () => {
  const mockFeelings = {
    data: {
      tags: [
        { id: '1', name: 'Happy' },
        { id: '2', name: 'Sad' },
      ],
    },
    isLoading: false,
  };

  it('renders loading skeleton when loading', () => {
    render(
      <FeelingList
        activeId=""
        onSelect={() => {}}
        queryRs={{ ...mockFeelings, isLoading: true }}
      />
    );
    expect(screen.getByRole('status')).toHaveAttribute(
      'aria-label',
      'Loading feelings list'
    );
    expect(screen.getAllByRole('status')[0]).toBeInTheDocument();
  });

  it('renders chips with feelings', () => {
    render(
      <FeelingList activeId="" onSelect={() => {}} queryRs={mockFeelings} />
    );

    expect(screen.getByText('Default')).toBeInTheDocument();
    expect(screen.getByText('Happy')).toBeInTheDocument();
    expect(screen.getByText('Sad')).toBeInTheDocument();
  });

  it('handles chip selection', () => {
    const onSelect = vi.fn();
    render(
      <FeelingList activeId="" onSelect={onSelect} queryRs={mockFeelings} />
    );

    fireEvent.click(screen.getByText('Happy'));
    expect(onSelect).toHaveBeenCalledWith('1');
  });

  it('highlights active chip', () => {
    render(
      <FeelingList activeId="1" onSelect={() => {}} queryRs={mockFeelings} />
    );

    expect(screen.getByRole('button', { name: 'Happy' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    expect(screen.getByRole('button', { name: 'Default' })).toHaveAttribute(
      'aria-pressed',
      'false'
    );
  });
});
