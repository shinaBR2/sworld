import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PlaylistLibrary } from './library';

const MockLink = (props: { children?: React.ReactNode }) => (
  <a href="#">{props.children}</a>
);

const playlists = [
  { id: 'p1', title: 'Chill', slug: 'chill' },
  { id: 'p2', title: 'Focus', slug: 'focus' },
];

describe('PlaylistLibrary', () => {
  it('renders skeletons while loading', () => {
    render(
      <PlaylistLibrary
        queryRs={{ playlists: [], isLoading: true }}
        onCreate={vi.fn()}
        LinkComponent={MockLink}
      />,
    );

    expect(screen.getByLabelText('loading playlists')).toBeInTheDocument();
  });

  it('renders an empty state when there are no playlists', () => {
    render(
      <PlaylistLibrary
        queryRs={{ playlists: [], isLoading: false }}
        onCreate={vi.fn()}
        LinkComponent={MockLink}
      />,
    );

    expect(screen.getByText(/no playlists yet/i)).toBeInTheDocument();
  });

  it('renders each playlist', () => {
    render(
      <PlaylistLibrary
        queryRs={{ playlists, isLoading: false }}
        onCreate={vi.fn()}
        LinkComponent={MockLink}
      />,
    );

    expect(screen.getByText('Chill')).toBeInTheDocument();
    expect(screen.getByText('Focus')).toBeInTheDocument();
  });

  it('shows an error message when the query errors', () => {
    render(
      <PlaylistLibrary
        queryRs={{ playlists: [], isLoading: false, error: new Error('x') }}
        onCreate={vi.fn()}
        LinkComponent={MockLink}
      />,
    );

    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });

  it('creates a playlist with the trimmed title', () => {
    const onCreate = vi.fn();
    render(
      <PlaylistLibrary
        queryRs={{ playlists, isLoading: false }}
        onCreate={onCreate}
        LinkComponent={MockLink}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'New playlist' }));
    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: '  Bangers  ' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Create' }));

    expect(onCreate).toHaveBeenCalledWith('Bangers');
  });

  it('does not create when the title is blank', () => {
    const onCreate = vi.fn();
    render(
      <PlaylistLibrary
        queryRs={{ playlists, isLoading: false }}
        onCreate={onCreate}
        LinkComponent={MockLink}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'New playlist' }));
    // Create button is disabled for a blank title.
    expect(screen.getByRole('button', { name: 'Create' })).toBeDisabled();
    expect(onCreate).not.toHaveBeenCalled();
  });
});
