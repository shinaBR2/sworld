import { createTheme, ThemeProvider } from '@mui/material';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AddExpenseButton } from './index';

// Mock the theme for testing
const theme = createTheme();

describe('AddExpenseButton', () => {
  // Mock the onAddExpense function
  const mockOnAddExpense = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = (props = {}) => {
    return render(
      <ThemeProvider theme={theme}>
        <AddExpenseButton onAddExpense={mockOnAddExpense} {...props} />
      </ThemeProvider>,
    );
  };

  it('renders the add button correctly', () => {
    renderComponent();

    // Check if the button is rendered
    const addButton = screen.getByLabelText('add expense');
    expect(addButton).toBeInTheDocument();
  });

  it('opens the dialog when the add button is clicked', async () => {
    renderComponent();

    // Click the add button
    const addButton = screen.getByLabelText('add expense');
    await userEvent.click(addButton);

    // Check if the dialog is opened
    const dialogTitle = screen.getByText('Add New Expense');
    expect(dialogTitle).toBeInTheDocument();
  });

  it('closes the dialog when cancel button is clicked', async () => {
    renderComponent();

    // Open the dialog
    const addButton = screen.getByLabelText('add expense');
    await userEvent.click(addButton);

    // Click the cancel button
    const cancelButton = screen.getByText('Cancel');
    await userEvent.click(cancelButton);

    // Check if the dialog is closed
    await waitFor(() => {
      expect(screen.queryByText('Add New Expense')).not.toBeInTheDocument();
    });
  });

  it('validates form fields correctly', async () => {
    renderComponent();

    // Open the dialog
    const addButton = screen.getByLabelText('add expense');
    await userEvent.click(addButton);

    // Try to submit without filling required fields
    const submitButton = screen.getByText('Add Expense');
    await userEvent.click(submitButton);

    // Check for validation errors
    expect(screen.getByText('Name is required')).toBeInTheDocument();
    expect(screen.getByText('Amount is required')).toBeInTheDocument();

    // Verify that onAddExpense was not called
    expect(mockOnAddExpense).not.toHaveBeenCalled();
  });

  it('submits the form with valid data', async () => {
    renderComponent();

    // Open the dialog
    const addButton = screen.getByLabelText('add expense');
    await userEvent.click(addButton);

    // Fill in the form
    const nameInput = screen.getByLabelText('Expense Name');
    const amountInput = screen.getByLabelText('Amount');

    await userEvent.type(nameInput, 'Test Expense');
    await userEvent.clear(amountInput);
    await userEvent.type(amountInput, '100');

    // Submit the form
    const submitButton = screen.getByText('Add Expense');
    await userEvent.click(submitButton);

    // Verify that onAddExpense was called with the correct data
    await waitFor(() => {
      expect(mockOnAddExpense).toHaveBeenCalledWith({
        name: 'Test Expense',
        note: '',
        amount: 100,
        category: 'must',
      });
    });

    // Check if the dialog is closed after submission
    await waitFor(() => {
      expect(screen.queryByText('Add New Expense')).not.toBeInTheDocument();
    });
  });

  it('handles form input changes correctly', async () => {
    renderComponent();

    // Open the dialog
    const addButton = screen.getByLabelText('add expense');
    await userEvent.click(addButton);

    // Fill in the form
    const nameInput = screen.getByLabelText('Expense Name');
    const noteInput = screen.getByLabelText('Note');
    const amountInput = screen.getByLabelText('Amount');

    await userEvent.type(nameInput, 'Test Expense');
    await userEvent.type(noteInput, 'Test Note');
    await userEvent.clear(amountInput);
    await userEvent.type(amountInput, '100');

    // Change category
    const categorySelect = screen.getByLabelText('Category');
    await userEvent.click(categorySelect);
    const niceOption = screen.getByText('Nice');
    await userEvent.click(niceOption);

    // Submit the form
    const submitButton = screen.getByText('Add Expense');
    await userEvent.click(submitButton);

    // Verify that onAddExpense was called with the correct data
    await waitFor(() => {
      expect(mockOnAddExpense).toHaveBeenCalledWith({
        name: 'Test Expense',
        note: 'Test Note',
        amount: 100,
        category: 'nice',
      });
    });
  });

  it('displays loading state during form submission', async () => {
    // Mock a delayed response
    const delayedMock = vi.fn().mockImplementation(() => {
      return new Promise((resolve) => setTimeout(resolve, 100));
    });

    renderComponent({ onAddExpense: delayedMock });

    // Open the dialog
    const addButton = screen.getByLabelText('add expense');
    await userEvent.click(addButton);

    // Fill in the form
    const nameInput = screen.getByLabelText('Expense Name');
    const amountInput = screen.getByLabelText('Amount');

    await userEvent.type(nameInput, 'Test Expense');
    await userEvent.clear(amountInput);
    await userEvent.type(amountInput, '100');

    // Submit the form
    const submitButton = screen.getByText('Add Expense');
    await userEvent.click(submitButton);

    // Check for loading state
    expect(screen.getByText('Adding...')).toBeInTheDocument();

    // Wait for submission to complete
    await waitFor(
      () => {
        expect(screen.queryByText('Adding...')).not.toBeInTheDocument();
      },
      { timeout: 200 },
    );
  });

  it('renders with different position styles', () => {
    // Test bottom-right position (default)
    const { rerender } = renderComponent();

    // Test bottom-center position
    rerender(
      <ThemeProvider theme={theme}>
        <AddExpenseButton
          onAddExpense={mockOnAddExpense}
          position="bottom-center"
        />
      </ThemeProvider>,
    );

    // The position styles are applied internally, so we're just checking
    // that the component renders without errors with different positions
    const addButton = screen.getByLabelText('add expense');
    expect(addButton).toBeInTheDocument();
  });

  it('handles error during form submission', async () => {
    // Mock console.error to prevent test output pollution
    const originalConsoleError = console.error;
    console.error = vi.fn();

    // Mock a rejected promise
    const errorMock = vi.fn().mockRejectedValue(new Error('Submission failed'));

    renderComponent({ onAddExpense: errorMock });

    // Open the dialog
    const addButton = screen.getByLabelText('add expense');
    await userEvent.click(addButton);

    // Fill in the form
    const nameInput = screen.getByLabelText('Expense Name');
    const amountInput = screen.getByLabelText('Amount');

    await userEvent.type(nameInput, 'Test Expense');
    await userEvent.clear(amountInput);
    await userEvent.type(amountInput, '100');

    // Submit the form
    const submitButton = screen.getByText('Add Expense');
    await userEvent.click(submitButton);

    // Wait for error handling
    await waitFor(() => {
      expect(console.error).toHaveBeenCalled();
    });

    // Dialog should still be open after error
    expect(screen.getByText('Add New Expense')).toBeInTheDocument();

    // Restore console.error
    console.error = originalConsoleError;
  });
});
