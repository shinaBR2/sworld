import { createLazyFileRoute } from '@tanstack/react-router';
import React, { lazy, useState } from 'react';
import { Layout } from '../components/layout';
import { Container, Grid, Typography } from 'ui/universal/containers/generic';
import { SummaryCard } from 'ui/main/home-page/summary-card';
import { MonthComparison } from 'ui/main/home-page/month-comparison';
import { SpendingBreakdown } from 'ui/main/home-page/spending-breakdown';
import { AddExpenseButton } from 'ui/main/home-page/add-button';
import { MonthSelector } from 'ui/main/home-page/month-selector';
import { TransactionsDialogProps } from 'ui/main/home-page/transactions-dialog';
import { useAuthContext } from 'core/providers/auth';
import { useLoadTransactionsByPeriod } from 'core/finance/query-hooks';
import { LoginDialogProps } from 'ui/universal/dialogs/login';

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

const TransactionsDialog = lazy(() =>
  import('ui/main/home-page/transactions-dialog').then(module => {
    const Component = module.TransactionsDialog;

    return { default: (props: TransactionsDialogProps) => <Component {...props} /> };
  })
);

const LoginDialog = lazy(() =>
  import('ui/universal/dialogs').then(module => {
    const Component = module.LoginDialog;
    return { default: (props: LoginDialogProps) => <Component {...props} /> };
  })
);

const Content = () => {
  const [currentMonthIndex, setCurrentMonthIndex] = useState(5); // Current month in the data array
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { getAccessToken } = useAuthContext();

  const currentDate = new Date();
  const { data, isLoading } = useLoadTransactionsByPeriod({
    month: currentDate.getMonth(),
    year: currentDate.getFullYear(),
    getAccessToken: getAccessToken,
  });

  console.log('data', data);
  console.log('isLoading', isLoading);

  // Current month data
  const currentMonth = monthlyData[currentMonthIndex];

  const categoryData = [
    { category: 'must', amount: data?.must.amount, count: data?.must.count },
    { category: 'nice', amount: data?.nice.amount, count: data?.nice.count },
    { category: 'waste', amount: data?.waste.amount, count: data?.waste.count },
    { category: 'total', amount: data?.total.amount, count: data?.total.count },
  ];

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
      setIsDialogOpen(true);
    }
  };

  const handleSummaryCardClick = category => {
    handleCategoryClick(category);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const handleAddExpense = async expenseData => {
    console.log('Adding expense:', expenseData);
    // In a real app, you would call your mutation hook here
    return Promise.resolve();
  };

  return (
    <Layout>
      <Container maxWidth="xl">
        <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" fontWeight="bold" py={2}>
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
        </Grid>
      </Container>

      <Container maxWidth="xl" component="main" sx={{ mb: 12 }}>
        <Grid container spacing={3}>
          {/* Summary Cards */}
          <Grid item xs={12}>
            <Grid container spacing={2}>
              {categoryData.map(data => (
                <Grid item xs={6} md={3} key={data.category}>
                  <SummaryCard
                    isLoading={isLoading}
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
          <Grid item xs={12} md={6}>
            <SpendingBreakdown
              categoryData={categoryData}
              handleCategoryClick={handleCategoryClick}
              selectedCategory={selectedCategory}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <MonthComparison data={monthlyData} currentMonthIndex={currentMonthIndex} />
          </Grid>
        </Grid>
      </Container>

      {/* Add Expense Button */}
      <AddExpenseButton onAddExpense={handleAddExpense} position="bottom-right" />

      <TransactionsDialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        transactions={transactions}
        selectedCategory={selectedCategory}
      />
    </Layout>
  );
};

const RouteComponent = () => {
  const { isSignedIn, isLoading, signIn } = useAuthContext();

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (!isSignedIn) {
    return <LoginDialog onAction={signIn} />;
  }

  return <Content />;
};

export const Route = createLazyFileRoute('/finance')({
  component: RouteComponent,
});
