import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PlayingList from './playing-list';
import { SAudioPlayerAudioItem } from 'core';

// Mock audio items for testing
const mockAudioItems: SAudioPlayerAudioItem[] = [
  {
    id: '1',
    name: 'Test Song 1',
    artistName: 'Artist 1',
    image: 'https://example.com/image1.jpg',
    src: 'https://example.com/song1.mp3',
  },
  {
    id: '2',
    name: 'Test Song 2',
    artistName: 'Artist 2',
    image: 'https://example.com/image2.jpg',
    src: 'https://example.com/song2.mp3',
  },
];

describe('PlayingList Component', () => {
  it('renders "No audio tracks available" when audioList is empty', () => {
    render(<PlayingList audioList={[]} currentId="" onItemSelect={vi.fn()} />);

    expect(screen.getByText('No audio tracks available')).toBeInTheDocument();
  });

  it('renders list of audio tracks correctly', () => {
    render(<PlayingList audioList={mockAudioItems} currentId="" onItemSelect={vi.fn()} />);

    // Check if both song names are rendered
    expect(screen.getByText('Test Song 1')).toBeInTheDocument();
    expect(screen.getByText('Test Song 2')).toBeInTheDocument();

    // Check if both artist names are rendered
    expect(screen.getByText('Artist 1')).toBeInTheDocument();
    expect(screen.getByText('Artist 2')).toBeInTheDocument();
  });

  it('highlights currently playing track', () => {
    render(<PlayingList audioList={mockAudioItems} currentId="1" onItemSelect={vi.fn()} />);

    // Find the list items
    const listItems = screen.getAllByRole('button');

    // Verify the first item (with id '1') has the playing styles
    expect(listItems[0]).toHaveStyle({
      borderLeft: '4px solid',
      backgroundColor: 'action.selected',
    });

    // Check "Now Playing" text appears for current track
    expect(screen.getByText('• Now Playing')).toBeInTheDocument();
  });

  it('calls onItemSelect when a track is clicked', () => {
    const mockOnItemSelect = vi.fn();

    const { container } = render(
      <PlayingList audioList={mockAudioItems} currentId="" onItemSelect={mockOnItemSelect} />
    );
    const trackButtons = screen.getAllByRole('button');

    if (trackButtons.length > 0) {
      fireEvent.click(trackButtons[0]);
    }

    // Expect the mock to be called
    expect(mockOnItemSelect).toHaveBeenCalledTimes(1);
    expect(mockOnItemSelect).toHaveBeenCalledWith('1');
  });

  it('renders ResponsiveAvatar for each track', () => {
    render(<PlayingList audioList={mockAudioItems} currentId="" onItemSelect={vi.fn()} />);

    // Check that images are rendered
    const avatars = screen.getAllByRole('img');
    expect(avatars).toHaveLength(2);

    // Check avatar sources and alt texts
    avatars.forEach((avatar, index) => {
      expect(avatar).toHaveAttribute('src', mockAudioItems[index].image);
      expect(avatar).toHaveAttribute('alt', mockAudioItems[index].name);

      if (mockAudioItems[index].image.includes('cloudinary')) {
        expect(avatar).toHaveAttribute('srcset');
        expect(avatar).toHaveAttribute('sizes');
      }
    });
  });
});
