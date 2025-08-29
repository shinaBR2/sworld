import { Close as CloseIcon } from '@mui/icons-material';
import {
  AppBar,
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import type { CategoryType } from 'core/finance';
import { formatNumber } from 'core/universal/common';

interface Transaction {
  id: string;
  name: string;
  amount: number;
  note?: string | null;
  month: number;
  year: number;
  category: string;
  createdAt: string;
}

interface TransactionsDialogProps {
  open: boolean;
  onClose: () => void;
  transactions: Transaction[];
  selectedCategory: CategoryType;
}

const getCategoryLabel = (category: CategoryType): string => {
  switch (category) {
    case 'must':
      return 'Must Expenses';
    case 'nice':
      return 'Nice Expenses';
    case 'waste':
      return 'Waste Expenses';
    default:
      return 'All Expenses';
  }
};

const getCategoryColor = (category: CategoryType): string => {
  switch (category) {
    case 'must':
      return '#ef444420';
    case 'nice':
      return '#3b82f620';
    case 'waste':
      return '#f59e0b20';
    default:
      return '#6b728020';
  }
};

const TransactionsDialog = ({
  open,
  onClose,
  transactions,
  selectedCategory,
}: TransactionsDialogProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Filter transactions based on selected category
  const filteredTransactions =
    selectedCategory && selectedCategory !== 'total'
      ? transactions.filter((t) => t.category === selectedCategory)
      : transactions;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={isMobile}
      fullWidth
      maxWidth="sm"
      scroll="paper"
    >
      {isMobile ? (
        <AppBar sx={{ position: 'relative' }}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={onClose}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
            <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
              {getCategoryLabel(selectedCategory)}
            </Typography>
          </Toolbar>
        </AppBar>
      ) : (
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="h6" component="div">
            {getCategoryLabel(selectedCategory)}
          </Typography>
          <IconButton aria-label="close" onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
      )}

      <DialogContent dividers sx={{ p: 0 }}>
        {filteredTransactions.length === 0 ? (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">
              No expenses found for this category
            </Typography>
          </Box>
        ) : (
          <Box sx={{ maxHeight: isMobile ? 'none' : '70vh' }}>
            {filteredTransactions.map((transaction) => (
              <Box
                key={transaction.id}
                sx={{
                  py: 2,
                  px: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  borderBottom: `1px solid ${theme.palette.divider}`,
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Box>
                    <Typography variant="subtitle1">
                      {transaction.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                    }}
                  >
                    <Box
                      sx={{
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 1,
                        backgroundColor: getCategoryColor(
                          transaction.category as CategoryType,
                        ),
                      }}
                    >
                      <Typography variant="body2" fontSize="0.75rem">
                        {
                          getCategoryLabel(
                            transaction.category as CategoryType,
                          ).split(' ')[0]
                        }
                      </Typography>
                    </Box>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {formatNumber(transaction.amount)}
                    </Typography>
                  </Box>
                </Box>
                {transaction.note && (
                  <Box
                    sx={{
                      mt: 2,
                      p: 1.5,
                      backgroundColor: theme.palette.grey[50],
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      {transaction.note}
                    </Typography>
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export { TransactionsDialog, type TransactionsDialogProps };
