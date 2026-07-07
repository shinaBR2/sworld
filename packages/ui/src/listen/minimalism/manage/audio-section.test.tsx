import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AudioSection } from './audio-section';
import '@testing-library/jest-dom';

const audios = [
  {
    id: 'a1',
    name: 'Unravel',
    artistName: 'TK',
    thumbnailUrl: '',
    source: 'unravel.mp3',
    tagIds: ['t1'],
  },
];

const feelings = [
  { id: 't1', name: 'sad' },
  { id: 't2', name: 'calm' },
];

const baseProps = {
  isLoading: false,
  audios,
  feelings,
  onUpdateAudio: vi.fn(),
  onDeleteAudio: vi.fn(),
  onAssignFeeling: vi.fn(),
  onUnassignFeeling: vi.fn(),
};

describe('AudioSection', () => {
  it('edits an audio through the dialog seeded with its values', () => {
    const onUpdateAudio = vi.fn();
    render(<AudioSection {...baseProps} onUpdateAudio={onUpdateAudio} />);

    fireEvent.click(screen.getByRole('button', { name: 'Edit Unravel' }));

    const dialog = screen.getByRole('dialog');
    const nameField = within(dialog).getByLabelText('Name');
    expect(nameField).toHaveValue('Unravel');
    fireEvent.change(nameField, { target: { value: 'Unravel (acoustic)' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Save' }));

    expect(onUpdateAudio).toHaveBeenCalledWith({
      id: 'a1',
      name: 'Unravel (acoustic)',
      artistName: 'TK',
      thumbnailUrl: '',
    });
  });

  it('deletes an audio after confirmation', () => {
    const onDeleteAudio = vi.fn();
    render(<AudioSection {...baseProps} onDeleteAudio={onDeleteAudio} />);

    fireEvent.click(screen.getByRole('button', { name: 'Delete Unravel' }));
    fireEvent.click(
      within(screen.getByRole('dialog')).getByRole('button', {
        name: 'Delete',
      }),
    );

    expect(onDeleteAudio).toHaveBeenCalledWith('a1');
  });

  it('assigns a feeling scoped to the audio', () => {
    const onAssignFeeling = vi.fn();
    render(<AudioSection {...baseProps} onAssignFeeling={onAssignFeeling} />);

    fireEvent.click(screen.getByText('Add feeling'));
    fireEvent.click(screen.getByText('calm'));

    expect(onAssignFeeling).toHaveBeenCalledWith({
      audioId: 'a1',
      tagId: 't2',
    });
  });
});
