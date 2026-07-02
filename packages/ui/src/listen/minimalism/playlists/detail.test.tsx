import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PlaylistDetail } from './detail';

// Stub the player + audio hook so this stays a focused unit test.
vi.mock('../music-widget', () => ({
  default: () => <div data-testid="music-widget" />,
}));

vi.mock('core', () => ({
  default: {
    useSAudioPlayer: () => ({
      getControlsProps: () => ({ onPlay: vi.fn() }),
      getAudioProps: () => ({}),
      getSeekerProps: () => ({}),
      playerState: { isPlay: false, audioItem: null },
    }),
  },
}));

const MockLink = (props: { children?: React.ReactNode }) => (
  <a href="#">{props.children}</a>
);

const audios = [
  {
    id: 'a1',
    name: 'First',
    source: 's1',
    thumbnailUrl: 't1',
    artistName: 'Artist 1',
  },
  {
    id: 'a2',
    name: 'Second',
    source: 's2',
    thumbnailUrl: 't2',
    artistName: 'Artist 2',
  },
];

describe('PlaylistDetail', () => {
  it('renders a loading state', () => {
    render(
      <PlaylistDetail
        queryRs={{ playlist: null, audios: [], isLoading: true }}
        LinkComponent={MockLink}
      />,
    );

    expect(screen.getByLabelText('loading playlist')).toBeInTheDocument();
  });

  it('renders an error state when the playlist is missing', () => {
    render(
      <PlaylistDetail
        queryRs={{ playlist: null, audios: [], isLoading: false }}
        LinkComponent={MockLink}
      />,
    );

    expect(screen.getByText(/could not be loaded/i)).toBeInTheDocument();
  });

  it('renders an empty state for a playlist with no audios', () => {
    render(
      <PlaylistDetail
        queryRs={{
          playlist: { title: 'Chill' },
          audios: [],
          isLoading: false,
        }}
        LinkComponent={MockLink}
      />,
    );

    expect(screen.getByText('Chill')).toBeInTheDocument();
    expect(screen.getByText(/no audios yet/i)).toBeInTheDocument();
  });

  it('renders the player and each audio', () => {
    render(
      <PlaylistDetail
        queryRs={{ playlist: { title: 'Chill' }, audios, isLoading: false }}
        LinkComponent={MockLink}
      />,
    );

    expect(screen.getByTestId('music-widget')).toBeInTheDocument();
    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();
  });

  it('calls onRemove with the audio id', () => {
    const onRemove = vi.fn();
    render(
      <PlaylistDetail
        queryRs={{ playlist: { title: 'Chill' }, audios, isLoading: false }}
        onRemove={onRemove}
        LinkComponent={MockLink}
      />,
    );

    fireEvent.click(screen.getByLabelText('remove First'));
    expect(onRemove).toHaveBeenCalledWith('a1');
  });
});
