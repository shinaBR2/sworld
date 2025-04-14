import React, { useState } from 'react';
import {
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  InputAdornment,
  Zoom,
  Box,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { CategoryType } from 'core/finance';

type ExpenseFormData = {
  name: string;
  note?: string;
  amount: number;
  category: Exclude<CategoryType, 'total'>;
};

interface AddExpenseButtonProps {
  onAddExpense: (expense: ExpenseFormData) => Promise<void>;
  position?: 'bottom-right' | 'bottom-center';
}

const AddExpenseButton = ({ onAddExpense, position = 'bottom-right' }: AddExpenseButtonProps) => {
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;

    if (name) {
      setFormData(prev => ({ ...prev, [name]: value }));

      // Clear the error for this field if it exists
      if (errors[name as keyof typeof errors]) {
        setErrors(prev => ({ ...prev, [name]: undefined }));
      }
    }
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
        amount: formData.amount,
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
          // @ts-ignore
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
        PaperProps={{
          sx: {
            borderRadius: isMobile ? 0 : 2,
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
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                value={formData.amount}
                onChange={handleChange}
                error={!!errors.amount}
                helperText={errors.amount}
                disabled={loading}
              />

              <FormControl sx={{ width: '50%' }} error={!!errors.category} disabled={loading}>
                <InputLabel id="category-label">Category</InputLabel>
                <Select
                  labelId="category-label"
                  name="category"
                  value={formData.category}
                  label="Category"
                  onChange={e => handleChange(e as any)}
                >
                  <MenuItem value="must">Must</MenuItem>
                  <MenuItem value="nice">Nice</MenuItem>
                  <MenuItem value="waste">Waste</MenuItem>
                </Select>
                {errors.category && <FormHelperText>{errors.category}</FormHelperText>}
              </FormControl>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleClose} disabled={loading} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleSubmit} variant="contained" disabled={loading} color="primary">
            {loading ? 'Adding...' : 'Add Expense'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export { AddExpenseButton, type ExpenseFormData, type AddExpenseButtonProps };
