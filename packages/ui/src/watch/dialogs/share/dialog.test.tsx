import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ShareDialog } from './dialog';

describe('ShareDialog', () => {
  const mockOnClose = vi.fn();
  const mockOnShare = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render when open is true', () => {
    render(<ShareDialog open={true} onClose={mockOnClose} onShare={mockOnShare} />);

    expect(screen.getByText('Share Video')).toBeInTheDocument();
    expect(screen.getByLabelText('Email addresses')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Share')).toBeInTheDocument();
  });

  it('should not call onShare when no emails are entered', () => {
    render(<ShareDialog open={true} onClose={mockOnClose} onShare={mockOnShare} />);

    fireEvent.click(screen.getByText('Share'));

    expect(mockOnShare).toHaveBeenCalledWith([]);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should handle single email input', () => {
    render(<ShareDialog open={true} onClose={mockOnClose} onShare={mockOnShare} />);

    const input = screen.getByLabelText('Email addresses');
    fireEvent.change(input, { target: { value: 'test@example.com' } });
    fireEvent.click(screen.getByText('Share'));

    expect(mockOnShare).toHaveBeenCalledWith(['test@example.com']);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should handle multiple email inputs', () => {
    render(<ShareDialog open={true} onClose={mockOnClose} onShare={mockOnShare} />);

    const input = screen.getByLabelText('Email addresses');
    fireEvent.change(input, {
      target: { value: 'test1@example.com, test2@example.com, test3@example.com' },
    });
    fireEvent.click(screen.getByText('Share'));

    expect(mockOnShare).toHaveBeenCalledWith(['test1@example.com', 'test2@example.com', 'test3@example.com']);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should handle emails with extra spaces', () => {
    render(<ShareDialog open={true} onClose={mockOnClose} onShare={mockOnShare} />);

    const input = screen.getByLabelText('Email addresses');
    fireEvent.change(input, {
      target: { value: '  test1@example.com ,   test2@example.com  ' },
    });
    fireEvent.click(screen.getByText('Share'));

    expect(mockOnShare).toHaveBeenCalledWith(['test1@example.com', 'test2@example.com']);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should close dialog when Cancel is clicked', () => {
    render(<ShareDialog open={true} onClose={mockOnClose} onShare={mockOnShare} />);

    fireEvent.click(screen.getByText('Cancel'));

    expect(mockOnClose).toHaveBeenCalled();
    expect(mockOnShare).not.toHaveBeenCalled();
  });

  it('should filter out empty emails', () => {
    render(<ShareDialog open={true} onClose={mockOnClose} onShare={mockOnShare} />);

    const input = screen.getByLabelText('Email addresses');
    fireEvent.change(input, {
      target: { value: 'test1@example.com,, test2@example.com,  , test3@example.com,' },
    });
    fireEvent.click(screen.getByText('Share'));

    expect(mockOnShare).toHaveBeenCalledWith(['test1@example.com', 'test2@example.com', 'test3@example.com']);
    expect(mockOnClose).toHaveBeenCalled();
  });
});
