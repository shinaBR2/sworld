import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CollectionSelect } from './index';

describe('CollectionSelect', () => {
  const playlists = [
    { id: '1', title: 'Focus' },
    { id: '2', title: 'Chill' },
  ];

  const openMenu = () => {
    fireEvent.mouseDown(screen.getByRole('combobox'));
  };

  it('renders All, playlist options and New playlist', () => {
    render(
      <CollectionSelect
        value="all"
        playlists={playlists}
        onSelect={() => {}}
        onCreateNew={() => {}}
      />,
    );

    openMenu();
    const listbox = within(screen.getByRole('listbox'));
    expect(listbox.getByRole('option', { name: 'All' })).toBeInTheDocument();
    expect(listbox.getByRole('option', { name: 'Focus' })).toBeInTheDocument();
    expect(listbox.getByRole('option', { name: 'Chill' })).toBeInTheDocument();
    expect(
      listbox.getByRole('option', { name: /New playlist/ }),
    ).toBeInTheDocument();
  });

  it('reflects the value from props', () => {
    render(
      <CollectionSelect
        value="2"
        playlists={playlists}
        onSelect={() => {}}
        onCreateNew={() => {}}
      />,
    );

    expect(screen.getByRole('combobox')).toHaveTextContent('Chill');
  });

  it('reflects the "all" value from props', () => {
    render(
      <CollectionSelect
        value="all"
        playlists={playlists}
        onSelect={() => {}}
        onCreateNew={() => {}}
      />,
    );

    expect(screen.getByRole('combobox')).toHaveTextContent('All');
  });

  it('calls onSelect with "all" when selecting All', () => {
    const onSelect = vi.fn();
    render(
      <CollectionSelect
        value="2"
        playlists={playlists}
        onSelect={onSelect}
        onCreateNew={() => {}}
      />,
    );

    openMenu();
    fireEvent.click(screen.getByRole('option', { name: 'All' }));
    expect(onSelect).toHaveBeenCalledWith('all');
  });

  it('calls onSelect with the playlist id when selecting a playlist', () => {
    const onSelect = vi.fn();
    render(
      <CollectionSelect
        value="all"
        playlists={playlists}
        onSelect={onSelect}
        onCreateNew={() => {}}
      />,
    );

    openMenu();
    fireEvent.click(screen.getByRole('option', { name: 'Focus' }));
    expect(onSelect).toHaveBeenCalledWith('1');
  });

  it('calls onCreateNew without changing the value when selecting New playlist', () => {
    const onSelect = vi.fn();
    const onCreateNew = vi.fn();
    render(
      <CollectionSelect
        value="all"
        playlists={playlists}
        onSelect={onSelect}
        onCreateNew={onCreateNew}
      />,
    );

    openMenu();
    fireEvent.click(screen.getByRole('option', { name: /New playlist/ }));
    expect(onCreateNew).toHaveBeenCalledTimes(1);
    expect(onSelect).not.toHaveBeenCalled();
  });
});
