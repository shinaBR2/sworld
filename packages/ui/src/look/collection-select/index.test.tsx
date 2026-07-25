import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { LookCollectionSelect } from './index';

describe('LookCollectionSelect', () => {
  const albums = [
    { id: '1', title: 'Summer' },
    { id: '2', title: 'Winter' },
  ];

  const openMenu = () => {
    fireEvent.mouseDown(screen.getByRole('combobox'));
  };

  it('renders All Photos and an option per album', () => {
    render(
      <LookCollectionSelect value="all" albums={albums} onSelect={() => {}} />,
    );

    openMenu();
    const listbox = within(screen.getByRole('listbox'));
    expect(
      listbox.getByRole('option', { name: 'All Photos' }),
    ).toBeInTheDocument();
    expect(listbox.getByRole('option', { name: 'Summer' })).toBeInTheDocument();
    expect(listbox.getByRole('option', { name: 'Winter' })).toBeInTheDocument();
  });

  it('reflects an album value from props by title', () => {
    render(
      <LookCollectionSelect value="2" albums={albums} onSelect={() => {}} />,
    );

    expect(screen.getByRole('combobox')).toHaveTextContent('Winter');
  });

  it('reflects the "all" value from props', () => {
    render(
      <LookCollectionSelect value="all" albums={albums} onSelect={() => {}} />,
    );

    expect(screen.getByRole('combobox')).toHaveTextContent('All Photos');
  });

  it('shows no label (never a raw id) when the value matches no loaded album', () => {
    render(
      <LookCollectionSelect
        value="missing"
        albums={albums}
        onSelect={() => {}}
      />,
    );

    expect(screen.getByRole('combobox')).not.toHaveTextContent('missing');
  });

  it('calls onSelect with "all" when selecting All Photos', () => {
    const onSelect = vi.fn();
    render(
      <LookCollectionSelect value="2" albums={albums} onSelect={onSelect} />,
    );

    openMenu();
    fireEvent.click(screen.getByRole('option', { name: 'All Photos' }));
    expect(onSelect).toHaveBeenCalledWith('all');
  });

  it('calls onSelect with the album id when selecting an album', () => {
    const onSelect = vi.fn();
    render(
      <LookCollectionSelect value="all" albums={albums} onSelect={onSelect} />,
    );

    openMenu();
    fireEvent.click(screen.getByRole('option', { name: 'Summer' }));
    expect(onSelect).toHaveBeenCalledWith('1');
  });
});
