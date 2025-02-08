import { describe, it, expect, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SubmitButton } from './submit-button';
import { texts } from './texts';

// Centralize element queries
const elements = {
  button: () => screen.getByRole('button'),
  progressBar: () => screen.getByRole('progressbar'),
};

describe('SubmitButton', () => {
  const defaultProps = {
    isSubmitting: false,
    onClick: vi.fn(),
  };

  it('renders with default state', () => {
    render(<SubmitButton {...defaultProps} />);

    expect(elements.button()).toBeInTheDocument();
    expect(elements.button()).toHaveTextContent(texts.form.submitButton.submit);
    expect(elements.button()).not.toBeDisabled();
  });

  it('shows submitting state with spinner', () => {
    render(<SubmitButton {...defaultProps} isSubmitting={true} />);

    expect(elements.progressBar()).toBeInTheDocument();
    expect(elements.button()).toHaveTextContent(texts.form.submitButton.submitting);
    expect(elements.button()).toBeDisabled();
    expect(elements.button()).toHaveAttribute('aria-busy', 'true');
  });

  it('calls onClick handler when clicked', async () => {
    render(<SubmitButton {...defaultProps} />);

    await userEvent.click(elements.button());
    expect(defaultProps.onClick).toHaveBeenCalled();
  });

  it('maintains proper button styling', () => {
    render(<SubmitButton {...defaultProps} />);

    const button = elements.button();
    expect(button).toHaveAttribute('type', 'submit');
    expect(button).toHaveClass('MuiButton-contained');
    expect(button).toHaveClass('MuiButton-fullWidth');
  });

  it('handles transition between states correctly', () => {
    const { rerender } = render(<SubmitButton {...defaultProps} />);

    // Initial state
    expect(elements.button()).toHaveTextContent(texts.form.submitButton.submit);

    // Transition to submitting
    rerender(<SubmitButton {...defaultProps} isSubmitting={true} />);
    expect(elements.button()).toHaveTextContent(texts.form.submitButton.submitting);
    expect(elements.progressBar()).toBeInTheDocument();

    // Transition back to default
    rerender(<SubmitButton {...defaultProps} isSubmitting={false} />);
    expect(elements.button()).toHaveTextContent(texts.form.submitButton.submit);
  });
});
