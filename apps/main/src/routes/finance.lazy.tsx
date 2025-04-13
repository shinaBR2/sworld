import { createLazyFileRoute } from '@tanstack/react-router';
import React, { useState } from 'react';
import { Layout } from '../components/layout';
import { Grid } from 'ui/universal/containers/grid';
import { SummaryCard } from 'ui/main/home-page/summary-card';
import { MonthComparison } from 'ui/main/home-page/month-comparison';
import { DonutChart } from 'ui/main/home-page/donut-chart';
import { AddExpenseButton } from 'ui/main/home-page/add-button';

const generateMockData = () => {
  // Generate mock monthly data for the last 6 months
  const monthlyData = [];

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Generate data for the last 6 months
  for (let i = 5; i >= 0; i--) {
    const monthIndex = (currentMonth - i + 12) % 12; // Ensure it's positive
    const year = currentYear - (currentMonth - i < 0 ? 1 : 0);
    const month = monthIndex + 1; // JavaScript months are 0-indexed

    // Generate random amounts for each category
    const mustAmount = Math.round(Math.random() * 8000 + 2000) / 100; // $20-$100
    const niceAmount = Math.round(Math.random() * 5000 + 1000) / 100; // $10-$60
    const wasteAmount = Math.round(Math.random() * 3000 + 500) / 100; // $5-$35

    monthlyData.push({
      month: `${year}-${month.toString().padStart(2, '0')}`,
      displayMonth: monthNames[monthIndex],
      total: mustAmount + niceAmount + wasteAmount,
      categories: {
        must: mustAmount,
        nice: niceAmount,
        waste: wasteAmount,
      },
    });
  }

  // Generate mock transactions for the current month
  const transactions = [];
  const categories = ['must', 'nice', 'waste'];
  const expenseNames = [
    'Groceries',
    'Rent',
    'Utilities',
    'Internet',
    'Dining out',
    'Movies',
    'Coffee',
    'Books',
    'Clothing',
    'Subscription',
    'Electronics',
    'Gift',
  ];

  // Generate 15 transactions
  for (let i = 0; i < 15; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const name = expenseNames[Math.floor(Math.random() * expenseNames.length)];
    const amount = Math.round(Math.random() * 10000 + 500) / 100; // $5-$105

    // Generate a random date within the current month
    const day = Math.floor(Math.random() * 28) + 1;
    const date = new Date(currentYear, currentMonth, day);

    transactions.push({
      id: `tx-${i}`,
      name,
      amount,
      category,
      date: date.toISOString(),
    });
  }

  return { monthlyData, transactions };
};

const { monthlyData, transactions } = generateMockData();

const RouteComponent = () => {
  const [currentMonthIndex, setCurrentMonthIndex] = useState(5); // Current month in the data array
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showTransactions, setShowTransactions] = useState(false);

  // Current month data
  const currentMonth = monthlyData[currentMonthIndex];

  // Prepare data for components
  const categoryData = [
    { category: 'must', amount: currentMonth.categories.must || 0, count: 5 },
    { category: 'nice', amount: currentMonth.categories.nice || 0, count: 3 },
    { category: 'waste', amount: currentMonth.categories.waste || 0, count: 2 },
    { category: 'total', amount: currentMonth.total, count: 10 },
  ];

  // Handlers
  const handlePrevMonth = () => {
    if (currentMonthIndex > 0) {
      setCurrentMonthIndex(currentMonthIndex - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonthIndex < monthlyData.length - 1) {
      setCurrentMonthIndex(currentMonthIndex + 1);
    }
  };

  const handleCategoryClick = category => {
    if (category === selectedCategory) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(category);
      setShowTransactions(true);
    }
  };

  const handleSummaryCardClick = category => {
    handleCategoryClick(category);
    setShowTransactions(true);
  };

  const handleAddExpense = async expenseData => {
    console.log('Adding expense:', expenseData);
    // In a real app, you would call your mutation hook here
    return Promise.resolve();
  };

  // Filter transactions based on selected category
  const filteredTransactions = selectedCategory
    ? transactions.filter(t => t.category === selectedCategory)
    : transactions;

  return (
    <Layout>
      {/* <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Finance Dashboard
        </Typography>

        <MonthSelector
          currentMonth={currentMonth.month}
          displayMonth={`${currentMonth.displayMonth} ${currentMonth.month.split('-')[0]}`}
          onPreviousMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          disablePrevious={currentMonthIndex === 0}
          disableNext={currentMonthIndex === monthlyData.length - 1}
          variant="plain"
        />
      </Box> */}

      <Grid container spacing={3}>
        {/* Summary Cards */}
        <Grid item xs={12}>
          <Grid container spacing={2}>
            {categoryData.map(data => (
              <Grid item xs={6} md={3} key={data.category}>
                <SummaryCard
                  category={data.category}
                  amount={data.amount}
                  count={data.count}
                  onClick={() => handleSummaryCardClick(data.category === 'total' ? null : data.category)}
                  selected={data.category === selectedCategory}
                />
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* Charts Section */}
        {/* <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Spending Breakdown
              </Typography>
              <DonutChart
                data={categoryData.filter(d => d.category !== 'total')}
                onCategoryClick={handleCategoryClick}
                selectedCategory={selectedCategory}
              />
            </CardContent>
          </Card>
        </Grid> */}

        {/* <Grid item xs={12} md={6}>
          <MonthComparison data={monthlyData} currentMonthIndex={currentMonthIndex} />
        </Grid> */}

        {/* Transaction List Section - Show when a category is selected */}
        {/* {showTransactions && (
          <Grid item xs={12}>
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
                          selectedCategory === 'must'
                            ? '#ef444420'
                            : selectedCategory === 'nice'
                            ? '#3b82f620'
                            : '#f59e0b20'
                        }`,
                      }}
                    >
                      <Typography variant="body2" fontWeight="medium">
                        {selectedCategory === 'must'
                          ? 'Must-Have'
                          : selectedCategory === 'nice'
                          ? 'Nice-to-Have'
                          : 'Waste'}
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
                              {transaction.category === 'must'
                                ? 'Must'
                                : transaction.category === 'nice'
                                ? 'Nice'
                                : 'Waste'}
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
          </Grid>
        )} */}
      </Grid>

      {/* Add Expense Button */}
      <AddExpenseButton onAddExpense={handleAddExpense} position="bottom-right" />
    </Layout>
  );
};

export const Route = createLazyFileRoute('/finance')({
  component: RouteComponent,
});
