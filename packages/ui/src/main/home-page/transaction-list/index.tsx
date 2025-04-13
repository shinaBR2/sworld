import { Card, CardContent, Box, Typography } from '@mui/material';

interface TransactionListProps {
  transactions: any[];
  selectedCategory: string;
}

const TransactionList = (props: TransactionListProps) => {
  const { transactions, selectedCategory } = props;
  const filteredTransactions = selectedCategory
    ? transactions.filter(transaction => transaction.category === selectedCategory)
    : transactions;

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            {selectedCategory
              ? `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Expenses`
              : 'All Expenses'}
          </Typography>

          {selectedCategory && (
            <Box
              sx={{
                display: 'inline-block',
                px: 1.5,
                py: 0.5,
                borderRadius: 1,
                backgroundColor: `${
                  selectedCategory === 'must' ? '#ef444420' : selectedCategory === 'nice' ? '#3b82f620' : '#f59e0b20'
                }`,
              }}
            >
              <Typography variant="body2" fontWeight="medium">
                {selectedCategory === 'must' ? 'Must-Have' : selectedCategory === 'nice' ? 'Nice-to-Have' : 'Waste'}
              </Typography>
            </Box>
          )}
        </Box>

        <Box sx={{ maxHeight: '400px', overflowY: 'auto' }}>
          {filteredTransactions.length === 0 ? (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">No expenses found for this category</Typography>
            </Box>
          ) : (
            filteredTransactions.map(transaction => (
              <Box
                key={transaction.id}
                sx={{
                  py: 2,
                  px: 1,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  // borderBottom: `1px solid ${theme.palette.divider}`,
                }}
              >
                <Box>
                  <Typography variant="subtitle1">{transaction.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(transaction.date).toLocaleDateString()}
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
                      backgroundColor: `${
                        transaction.category === 'must'
                          ? '#ef444420'
                          : transaction.category === 'nice'
                          ? '#3b82f620'
                          : '#f59e0b20'
                      }`,
                    }}
                  >
                    <Typography variant="body2" fontSize="0.75rem">
                      {transaction.category === 'must' ? 'Must' : transaction.category === 'nice' ? 'Nice' : 'Waste'}
                    </Typography>
                  </Box>
                  <Typography variant="subtitle1" fontWeight="bold">
                    ${transaction.amount.toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            ))
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export { TransactionList };
