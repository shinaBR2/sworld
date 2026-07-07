import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PlaylistSection } from './playlist-section';
import '@testing-library/jest-dom';

const playlists = [
  {
    id: 'p1',
    title: 'Chill',
    slug: 'chill',
    description: 'relax',
    thumbnailUrl: '',
  },
];

const baseProps = {
  isLoading: false,
  playlists,
  onCreatePlaylist: vi.fn(),
  onUpdatePlaylist: vi.fn(),
  onDeletePlaylist: vi.fn(),
  onOpenPlaylist: vi.fn(),
};

const getDialog = () => screen.getByRole('dialog');

describe('PlaylistSection', () => {
  it('routes the create form to onCreatePlaylist', () => {
    const onCreatePlaylist = vi.fn();
    render(
      <PlaylistSection {...baseProps} onCreatePlaylist={onCreatePlaylist} />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'New playlist' }));

    const dialog = getDialog();
    fireEvent.change(within(dialog).getByLabelText('Title'), {
      target: { value: 'Focus' },
    });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Create' }));

    expect(onCreatePlaylist).toHaveBeenCalledWith({
      title: 'Focus',
      description: '',
    });
  });

  it('routes the edit form to onUpdatePlaylist with the playlist id', () => {
    const onUpdatePlaylist = vi.fn();
    render(
      <PlaylistSection {...baseProps} onUpdatePlaylist={onUpdatePlaylist} />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Edit Chill' }));

    const dialog = getDialog();
    const titleField = within(dialog).getByLabelText('Title');
    fireEvent.change(titleField, { target: { value: 'Chill vibes' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Save' }));

    expect(onUpdatePlaylist).toHaveBeenCalledWith({
      id: 'p1',
      title: 'Chill vibes',
      description: 'relax',
    });
  });

  it('deletes after confirmation', () => {
    const onDeletePlaylist = vi.fn();
    render(
      <PlaylistSection {...baseProps} onDeletePlaylist={onDeletePlaylist} />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Delete Chill' }));
    fireEvent.click(
      within(getDialog()).getByRole('button', { name: 'Delete' }),
    );

    expect(onDeletePlaylist).toHaveBeenCalledWith('p1');
  });

  it('opens the playlist detail when its title is clicked', () => {
    const onOpenPlaylist = vi.fn();
    render(<PlaylistSection {...baseProps} onOpenPlaylist={onOpenPlaylist} />);

    fireEvent.click(screen.getByText('Chill'));

    expect(onOpenPlaylist).toHaveBeenCalledWith('p1');
  });
});
