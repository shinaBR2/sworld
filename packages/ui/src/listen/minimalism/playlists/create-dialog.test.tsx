import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CreatePlaylistDialog } from './create-dialog';

describe('CreatePlaylistDialog', () => {
  it('creates a playlist with the trimmed title and closes', () => {
    const onCreate = vi.fn();
    const onClose = vi.fn();
    render(<CreatePlaylistDialog open onClose={onClose} onCreate={onCreate} />);

    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: '  Bangers  ' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Create' }));

    expect(onCreate).toHaveBeenCalledWith('Bangers');
    expect(onClose).toHaveBeenCalled();
  });

  it('submits on Enter with the trimmed title', () => {
    const onCreate = vi.fn();
    const onClose = vi.fn();
    render(<CreatePlaylistDialog open onClose={onClose} onCreate={onCreate} />);

    const input = screen.getByLabelText('Title');
    fireEvent.change(input, { target: { value: '  Focus  ' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onCreate).toHaveBeenCalledWith('Focus');
    expect(onClose).toHaveBeenCalled();
  });

  it('does not submit a blank or whitespace title', () => {
    const onCreate = vi.fn();
    render(<CreatePlaylistDialog open onClose={vi.fn()} onCreate={onCreate} />);

    // Create is disabled for an empty title.
    expect(screen.getByRole('button', { name: 'Create' })).toBeDisabled();

    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: '   ' },
    });

    expect(screen.getByRole('button', { name: 'Create' })).toBeDisabled();
    fireEvent.keyDown(screen.getByLabelText('Title'), { key: 'Enter' });
    expect(onCreate).not.toHaveBeenCalled();
  });

  it('calls onClose when cancelled', () => {
    const onCreate = vi.fn();
    const onClose = vi.fn();
    render(<CreatePlaylistDialog open onClose={onClose} onCreate={onCreate} />);

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onClose).toHaveBeenCalled();
    expect(onCreate).not.toHaveBeenCalled();
  });
});
