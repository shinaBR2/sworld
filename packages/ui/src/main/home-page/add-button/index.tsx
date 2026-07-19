import { Add as AddIcon } from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Fab,
  FormControl,
  FormHelperText,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  useMediaQuery,
  useTheme,
  Zoom,
} from '@mui/material';
import type { CategoryType, Template } from 'core/finance';
import type React from 'react';
import { useState } from 'react';

type ExpenseCategory = Exclude<CategoryType, 'total'>;

// The single source of truth for the category options — the Select renders from
// this, and template rows are validated against it.
const EXPENSE_CATEGORIES: { value: ExpenseCategory; label: string }[] = [
  { value: 'must', label: 'Must' },
  { value: 'nice', label: 'Nice' },
  { value: 'waste', label: 'Waste' },
];

const isExpenseCategory = (value: string): value is ExpenseCategory =>
  EXPENSE_CATEGORIES.some((category) => category.value === value);

type ExpenseFormData = {
  name: string;
  note?: string;
  amount: number;
  category: ExpenseCategory;
};

// A template whose category passed validation, so it can prefill the form
// without an unchecked cast.
type SelectableTemplate = Omit<Template, 'category'> & {
  category: ExpenseCategory;
};

interface AddExpenseButtonProps {
  onAddExpense: (expense: ExpenseFormData) => Promise<void>;
  position?: 'bottom-right' | 'bottom-center';
  templates?: Template[];
}

const AddExpenseButton = ({
  onAddExpense,
  position = 'bottom-right',
  templates = [],
}: AddExpenseButtonProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ExpenseFormData>({
    name: '',
    note: '',
    amount: 0,
    category: 'must',
  });
  const [errors, setErrors] = useState<{
    name?: string;
    note?: string;
    amount?: string;
    category?: string;
  }>({});

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    if (loading) return;
    setOpen(false);
    // Reset form after animation completes
    setTimeout(() => {
      setFormData({ name: '', note: '', amount: 0, category: 'must' });
      setErrors({});
    }, 300);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>,
  ) => {
    const { name, value } = e.target;

    if (name) {
      setFormData((prev) => ({ ...prev, [name]: value }));

      // Clear the error for this field if it exists
      if (errors[name as keyof typeof errors]) {
        setErrors((prev) => ({ ...prev, [name]: undefined }));
      }
    }
  };

  // `category` is an unconstrained text column (the migration only checks
  // `amount > 0`), so a hand-seeded row can carry a value the Select has no
  // option for. validateForm only checks the field is non-empty, so such a row
  // would submit silently — drop it instead of offering a broken chip.
  const selectableTemplates = templates.flatMap<SelectableTemplate>(
    (template) => {
      const { category } = template;
      return isExpenseCategory(category) ? [{ ...template, category }] : [];
    },
  );

  // Pure prefill — fills the form and clears stale errors, never submits. The
  // user still presses "Add Expense". `amount` comes off a Hasura `numeric`
  // scalar typed `any`, so coerce it to keep state matching its declared type.
  const handleSelectTemplate = (template: SelectableTemplate) => {
    setFormData({
      name: template.name,
      note: template.note ?? '',
      amount: Number(template.amount),
      category: template.category,
    });
    setErrors({});
  };

  const validateForm = (): boolean => {
    const newErrors: {
      name?: string;
      amount?: string;
      category?: string;
    } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.amount) {
      newErrors.amount = 'Amount is required';
    } else {
      const amountValue = formData.amount;
      if (isNaN(amountValue)) {
        newErrors.amount = 'Amount must be a valid number';
      } else if (amountValue <= 0) {
        newErrors.amount = 'Amount must be greater than zero';
      }
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await onAddExpense({
        name: formData.name.trim(),
        note: formData.note?.trim() || '',
        amount: Number(formData.amount),
        category: formData.category,
      });
      handleClose();
    } catch (error) {
      console.error('Failed to add expense:', error);
      // You can add specific error handling here
    } finally {
      setLoading(false);
    }
  };

  const getPositionStyle = () => {
    switch (position) {
      case 'bottom-center':
        return {
          position: 'fixed',
          bottom: 24,
          left: '50%',
          transform: 'translateX(-50%)',
        };
      default:
        return {
          position: 'fixed',
          bottom: 24,
          right: 24,
        };
    }
  };

  return (
    <>
      <Zoom in={true}>
        <Fab
          color="primary"
          aria-label="add expense"
          onClick={handleClickOpen}
          // @ts-expect-error
          sx={{
            ...getPositionStyle(),
            zIndex: theme.zIndex.speedDial,
          }}
        >
          <AddIcon />
        </Fab>
      </Zoom>
      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="xs"
        fullScreen={isMobile}
        slotProps={{
          paper: {
            sx: {
              borderRadius: isMobile ? 0 : 2,
            },
          },
        }}
      >
        <DialogTitle>Add New Expense</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              name="name"
              label="Expense Name"
              fullWidth
              value={formData.name}
              onChange={handleChange}
              error={!!errors.name}
              helperText={errors.name}
              disabled={loading}
              autoFocus
            />
            <TextField
              name="note"
              label="Note"
              fullWidth
              value={formData.note}
              onChange={handleChange}
              error={!!errors.note}
              helperText={errors.note}
              disabled={loading}
            />

            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
              <TextField
                name="amount"
                label="Amount"
                sx={{ width: '50%' }}
                type="number"
                value={formData.amount}
                onChange={handleChange}
                error={!!errors.amount}
                helperText={errors.amount}
                disabled={loading}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">$</InputAdornment>
                    ),
                  },
                }}
              />

              <FormControl
                sx={{ width: '50%' }}
                error={!!errors.category}
                disabled={loading}
              >
                <InputLabel id="category-label">Category</InputLabel>
                <Select
                  labelId="category-label"
                  name="category"
                  value={formData.category}
                  label="Category"
                  onChange={(e) => handleChange(e as any)}
                >
                  {EXPENSE_CATEGORIES.map(({ value, label }) => (
                    <MenuItem key={value} value={value}>
                      {label}
                    </MenuItem>
                  ))}
                </Select>
                {errors.category && (
                  <FormHelperText>{errors.category}</FormHelperText>
                )}
              </FormControl>
            </Box>

            {/* Below the fields on purpose: the chips are a shortcut, not the
                primary input, and templates arrive asynchronously — sitting
                last means a late arrival can't shove the fields down while
                the user is already typing. */}
            {selectableTemplates.length > 0 && (
              <Stack
                direction="row"
                spacing={1}
                useFlexGap
                sx={{ flexWrap: 'wrap' }}
              >
                {selectableTemplates.map((template) => (
                  <Chip
                    key={template.id}
                    label={template.title}
                    variant="outlined"
                    disabled={loading}
                    onClick={() => handleSelectTemplate(template)}
                  />
                ))}
              </Stack>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleClose} disabled={loading} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading}
            color="primary"
          >
            {loading ? 'Adding...' : 'Add Expense'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export { AddExpenseButton, type ExpenseFormData, type AddExpenseButtonProps };
