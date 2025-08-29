import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SubtitleDialog } from './dialog';

describe('SubtitleDialog', () => {
  const mockOnClose = vi.fn();
  const mockOnSave = vi.fn();
  const testUrl = 'https://example.com/subtitles/english.vtt';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render when open is true', () => {
    render(
      <SubtitleDialog
        open={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        currentUrl=""
      />,
    );

    expect(screen.getByText('Edit Subtitle URL')).toBeInTheDocument();
    expect(screen.getByLabelText('Subtitle URL')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
  });

  it('should call onSave with the entered URL when form is submitted', () => {
    render(
      <SubtitleDialog
        open={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        currentUrl=""
      />,
    );

    const input = screen.getByLabelText('Subtitle URL');
    const saveButton = screen.getByText('Save');

    fireEvent.change(input, { target: { value: testUrl } });
    fireEvent.click(saveButton);

    expect(mockOnSave).toHaveBeenCalledWith(testUrl);
  });

  it('should call onSave with empty string when URL is cleared', () => {
    render(
      <SubtitleDialog
        open={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        currentUrl={testUrl}
      />,
    );

    const input = screen.getByLabelText('Subtitle URL');
    const saveButton = screen.getByText('Save');

    fireEvent.change(input, { target: { value: '' } });
    fireEvent.click(saveButton);

    expect(mockOnSave).toHaveBeenCalledWith('');
  });

  it('should close dialog when Cancel is clicked', () => {
    render(
      <SubtitleDialog
        open={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        currentUrl=""
      />,
    );

    fireEvent.click(screen.getByText('Cancel'));

    expect(mockOnClose).toHaveBeenCalled();
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('should reset URL when dialog is reopened', () => {
    const { rerender } = render(
      <SubtitleDialog
        open={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        currentUrl={testUrl}
      />,
    );

    // Change the URL but don't submit
    const input = screen.getByLabelText('Subtitle URL') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'https://changed-url.com' } });

    // Close and reopen dialog
    rerender(
      <SubtitleDialog
        open={false}
        onClose={mockOnClose}
        onSave={mockOnSave}
        currentUrl={testUrl}
      />,
    );

    rerender(
      <SubtitleDialog
        open={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        currentUrl={testUrl}
      />,
    );

    // Should show the original URL, not the changed one
    expect(input.value).toBe(testUrl);
  });
});
