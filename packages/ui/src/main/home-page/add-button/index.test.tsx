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

  it('offers every expense category in the select', async () => {
    renderComponent();

    await userEvent.click(screen.getByLabelText('add expense'));
    await userEvent.click(screen.getByLabelText('Category'));

    expect(screen.getAllByRole('option').map((option) => option.textContent)) //
      .toEqual(['Must', 'Nice', 'Waste']);
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

  describe('template chips', () => {
    const templates = [
      {
        id: 'tpl-1',
        title: 'ăn sáng cơm',
        name: 'Breakfast',
        note: 'com tam',
        amount: 35000,
        category: 'must',
      },
      {
        id: 'tpl-2',
        title: 'bánh canh cho bố mẹ',
        name: 'Banh canh',
        note: null,
        amount: 60000,
        category: 'nice',
      },
    ];

    const openDialogWithTemplates = async (props = {}) => {
      renderComponent({ templates, ...props });
      await userEvent.click(screen.getByLabelText('add expense'));
    };

    it('renders no chips when templates are omitted', async () => {
      renderComponent();
      await userEvent.click(screen.getByLabelText('add expense'));

      expect(screen.queryByText('ăn sáng cơm')).not.toBeInTheDocument();
    });

    it('renders a chip per template using its title', async () => {
      await openDialogWithTemplates();

      expect(screen.getByText('ăn sáng cơm')).toBeInTheDocument();
      expect(screen.getByText('bánh canh cho bố mẹ')).toBeInTheDocument();
    });

    it('renders the chips below the form fields', async () => {
      await openDialogWithTemplates();

      const categoryField = screen.getByLabelText('Category');
      const chip = screen.getByText('ăn sáng cơm');

      // Chips are a shortcut, so they sit after every field in document order
      expect(
        categoryField.compareDocumentPosition(chip) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    });

    it('prefills the form when a chip is clicked, without submitting', async () => {
      await openDialogWithTemplates();

      await userEvent.click(screen.getByText('ăn sáng cơm'));

      expect(screen.getByLabelText('Expense Name')).toHaveValue('Breakfast');
      expect(screen.getByLabelText('Note')).toHaveValue('com tam');
      expect(screen.getByLabelText('Amount')).toHaveValue(35000);
      expect(screen.getByLabelText('Category')).toHaveTextContent('Must');

      // Pure prefill — the user still has to press Add Expense
      expect(mockOnAddExpense).not.toHaveBeenCalled();
    });

    it('maps a null note to an empty string', async () => {
      await openDialogWithTemplates();

      await userEvent.click(screen.getByText('bánh canh cho bố mẹ'));

      expect(screen.getByLabelText('Note')).toHaveValue('');
      expect(screen.getByLabelText('Category')).toHaveTextContent('Nice');
    });

    it('drops templates whose category is not a real option', async () => {
      // `category` is an unconstrained text column, so a mis-seeded row must
      // not be offered — it would otherwise submit silently.
      await openDialogWithTemplates({
        templates: [
          ...templates,
          {
            id: 'tpl-3',
            title: 'typo row',
            name: 'Typo',
            note: null,
            amount: 1000,
            category: 'Must',
          },
        ],
      });

      expect(screen.queryByText('typo row')).not.toBeInTheDocument();
      expect(screen.getByText('ăn sáng cơm')).toBeInTheDocument();
    });

    it('renders no chip row when every template is malformed', async () => {
      await openDialogWithTemplates({
        templates: [
          {
            id: 'tpl-bad',
            title: 'bad row',
            name: 'Bad',
            note: null,
            amount: 1000,
            category: 'groceries',
          },
        ],
      });

      expect(screen.queryByText('bad row')).not.toBeInTheDocument();
    });

    it('clears existing validation errors on prefill', async () => {
      await openDialogWithTemplates();

      // Trigger validation errors first
      await userEvent.click(screen.getByText('Add Expense'));
      expect(screen.getByText('Name is required')).toBeInTheDocument();

      await userEvent.click(screen.getByText('ăn sáng cơm'));

      expect(screen.queryByText('Name is required')).not.toBeInTheDocument();
      expect(screen.queryByText('Amount is required')).not.toBeInTheDocument();
    });

    it('submits the prefilled values unchanged', async () => {
      await openDialogWithTemplates();

      await userEvent.click(screen.getByText('ăn sáng cơm'));
      await userEvent.click(screen.getByText('Add Expense'));

      await waitFor(() => {
        expect(mockOnAddExpense).toHaveBeenCalledWith({
          name: 'Breakfast',
          note: 'com tam',
          amount: 35000,
          category: 'must',
        });
      });
    });
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
