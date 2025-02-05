import { describe, it, expect, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SubmitButton } from './submit-button';
import { texts } from './texts';

describe('SubmitButton', () => {
  const defaultProps = {
    isBusy: false,
    isSubmitting: false,
    validating: false,
    showSubmitButton: false,
    urls: 'http://example.com',
    onClick: vi.fn(),
  };

  it('renders with default state', () => {
    act(() => {
      render(<SubmitButton {...defaultProps} />);
    });

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent(texts.form.submitButton.default);
    expect(button).not.toBeDisabled();
  });

  it('disables button when isBusy is true', () => {
    act(() => {
      render(<SubmitButton {...defaultProps} isBusy={true} />);
    });

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
  });

  it('disables button when urls is empty', () => {
    act(() => {
      render(<SubmitButton {...defaultProps} urls="" />);
    });

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('shows submit text when showSubmitButton is true', () => {
    act(() => {
      render(<SubmitButton {...defaultProps} showSubmitButton={true} />);
    });

    const button = screen.getByRole('button');
    expect(button).toHaveTextContent(texts.form.submitButton.submit);
  });

  it('shows validating state with spinner', () => {
    act(() => {
      render(<SubmitButton {...defaultProps} validating={true} />);
    });

    const button = screen.getByRole('button');
    const spinner = screen.getByRole('progressbar');

    expect(spinner).toBeInTheDocument();
    expect(button).toHaveTextContent(texts.form.submitButton.validating);
  });

  it('shows submitting state with spinner', () => {
    act(() => {
      render(<SubmitButton {...defaultProps} isSubmitting={true} />);
    });

    const button = screen.getByRole('button');
    const spinner = screen.getByRole('progressbar');

    expect(spinner).toBeInTheDocument();
    expect(button).toHaveTextContent(texts.form.submitButton.submitting);
  });

  it('calls onClick handler with prevented default event', async () => {
    act(() => {
      render(<SubmitButton {...defaultProps} />);
    });

    const button = screen.getByRole('button');
    await act(async () => {
      await userEvent.click(button);
    });

    expect(defaultProps.onClick).toHaveBeenCalled();
    const event = defaultProps.onClick.mock.calls[0][0];
    expect(event.defaultPrevented).toBe(true);
  });

  it('is disabled when isBusy is true', () => {
    act(() => {
      render(<SubmitButton {...defaultProps} isBusy={true} />);
    });

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
  });

  it('maintains proper button styling', () => {
    act(() => {
      render(<SubmitButton {...defaultProps} />);
    });

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('type', 'submit');
    expect(button).toHaveClass('MuiButton-contained');
    expect(button).toHaveClass('MuiButton-fullWidth');
  });

  it('handles transition between states correctly', () => {
    const { rerender } = render(<SubmitButton {...defaultProps} />);

    // Initial state
    let button = screen.getByRole('button');
    expect(button).toHaveTextContent(texts.form.submitButton.default);

    // Transition to validating
    act(() => {
      rerender(<SubmitButton {...defaultProps} validating={true} />);
    });
    expect(button).toHaveTextContent(texts.form.submitButton.validating);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    // Transition to submitting
    act(() => {
      rerender(<SubmitButton {...defaultProps} isSubmitting={true} />);
    });
    expect(button).toHaveTextContent(texts.form.submitButton.submitting);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    // Transition to submit ready
    act(() => {
      rerender(<SubmitButton {...defaultProps} showSubmitButton={true} />);
    });
    expect(button).toHaveTextContent(texts.form.submitButton.submit);
  });
});
