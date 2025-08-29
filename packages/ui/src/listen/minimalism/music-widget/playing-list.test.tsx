import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import PlayingList from './playing-list';

describe('PlayingList', () => {
  const mockAudioList = [
    { id: '1', name: 'Song 1' },
    { id: '2', name: 'Song 2' },
  ];

  it('renders audio list items', () => {
    render(
      <PlayingList
        audioList={mockAudioList}
        currentId=""
        onSelect={() => () => {}}
      />,
    );

    expect(screen.getByText('Song 1')).toBeInTheDocument();
    expect(screen.getByText('Song 2')).toBeInTheDocument();
  });

  it('shows playing for selected item', () => {
    render(
      <PlayingList
        audioList={mockAudioList}
        currentId="1"
        onSelect={() => () => {}}
      />,
    );

    const selectedItem = screen.getByText('Song 1').closest('li');
    expect(selectedItem).toHaveClass('Mui-selected');
    expect(selectedItem?.querySelector('svg')).toBeInTheDocument();
  });

  it('calls onSelect with correct id', () => {
    const mockOnSelect = vi.fn(() => () => {});
    render(
      <PlayingList
        audioList={mockAudioList}
        currentId=""
        onSelect={mockOnSelect}
      />,
    );

    fireEvent.click(screen.getByText('Song 1'));
    expect(mockOnSelect).toHaveBeenCalledWith('1');
  });

  it('truncates long text', () => {
    const longName = 'A'.repeat(100);
    render(
      <PlayingList
        audioList={[{ id: '1', name: longName }]}
        currentId=""
        onSelect={() => () => {}}
      />,
    );

    const text = screen.getByText(longName);
    expect(text).toHaveStyle({
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    });
  });
});
