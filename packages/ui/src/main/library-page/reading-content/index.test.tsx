import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ReadingContent } from './index';

describe('ReadingContent', () => {
  const defaultProps = {
    isLoading: false,
    error: null,
    pdfUrl: 'https://example.com/sample.pdf',
    onErrorClick: vi.fn(),
  };

  it('renders loading state', () => {
    render(<ReadingContent {...defaultProps} isLoading={true} error={null} />);
    expect(screen.getByText('Loading PDF...')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders error state with reload button', () => {
    const onErrorClick = vi.fn();
    render(
      <ReadingContent {...defaultProps} isLoading={false} error={'Failed to load PDF'} onErrorClick={onErrorClick} />
    );
    expect(screen.getByText('Failed to load PDF')).toBeInTheDocument();
    const reloadButton = screen.getByRole('button', { name: /reload/i });
    expect(reloadButton).toBeInTheDocument();
    fireEvent.click(reloadButton);
    expect(onErrorClick).toHaveBeenCalled();
  });

  it('renders PDF iframe when loaded and no error', () => {
    render(<ReadingContent {...defaultProps} isLoading={false} error={null} pdfUrl="https://example.com/test.pdf" />);
    // Should render an iframe with the correct src
    const iframe = document.querySelector('iframe');
    expect(iframe).toBeInTheDocument();
    expect(iframe?.getAttribute('src')).toBe('https://example.com/test.pdf');
  });

  it('shows info alert if no pdfUrl (empty string)', () => {
    render(<ReadingContent {...defaultProps} isLoading={false} error={null} pdfUrl={''} />);
    expect(screen.queryByRole('iframe')).not.toBeInTheDocument();
    expect(screen.getByText('This book is not available to read online.')).toBeInTheDocument();
  });

  it('shows info alert if no pdfUrl (whitespace)', () => {
    render(<ReadingContent {...defaultProps} isLoading={false} error={null} pdfUrl={'   '} />);
    expect(screen.queryByRole('iframe')).not.toBeInTheDocument();
    expect(screen.getByText('This book is not available to read online.')).toBeInTheDocument();
  });

  it('shows info alert if no pdfUrl (null)', () => {
    render(<ReadingContent {...defaultProps} isLoading={false} error={null} pdfUrl={null} />);
    expect(screen.queryByRole('iframe')).not.toBeInTheDocument();
    expect(screen.getByText('This book is not available to read online.')).toBeInTheDocument();
  });

  it('shows info alert if no pdfUrl (undefined)', () => {
    render(<ReadingContent {...defaultProps} isLoading={false} error={null} pdfUrl={undefined} />);
    expect(screen.queryByRole('iframe')).not.toBeInTheDocument();
    expect(screen.getByText('This book is not available to read online.')).toBeInTheDocument();
  });
});
