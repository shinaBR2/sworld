import { createLazyFileRoute } from '@tanstack/react-router';
import React, { lazy, useState } from 'react';
import { Layout } from '../components/layout';
import { Container, Grid, Typography } from 'ui/universal/containers/generic';
import { SummaryCard } from 'ui/main/home-page/summary-card';
// import { MonthComparison } from 'ui/main/home-page/month-comparison';
import { SpendingBreakdown } from 'ui/main/home-page/spending-breakdown';
import { AddExpenseButton } from 'ui/main/home-page/add-button';
import { MonthSelector } from 'ui/main/home-page/month-selector';
import { TransactionsDialogProps } from 'ui/main/home-page/transactions-dialog';
import { useAuthContext } from 'core/providers/auth';
import { useLoadTransactionsByPeriod } from 'core/finance/query-hooks';
import { LoginDialogProps } from 'ui/universal/dialogs/login';
import { CategoryType } from 'core/finance';

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

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const currentDate = new Date();
const initialMonth = currentDate.getMonth();
const initialYear = currentDate.getFullYear();

const Content = () => {
  const [currentMonth, setCurrentMonth] = useState(initialMonth);
  const [currentYear, setCurrentYear] = useState(initialYear);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { getAccessToken } = useAuthContext();

  console.log('currentMonth', currentMonth);
  console.log('currentYear', currentYear);
  console.log('selectedCategory', selectedCategory);
  console.log('isDialogOpen', isDialogOpen);

  const { data, isLoading } = useLoadTransactionsByPeriod({
    month: currentMonth,
    year: currentYear,
    getAccessToken: getAccessToken,
  });

  console.log('data', data);
  console.log('isLoading', isLoading);

  const isMaxMonth = currentMonth === initialMonth && currentYear === initialYear;

  const handlePrevMonth = () => {
    setCurrentMonth(currentMonth - 1);
  };

  const handleNextMonth = () => {
    if (isMaxMonth) {
      return;
    }
    // TODO handle next month navigation
    // Edge case: if current month is December, set to January of the next year
    // if (currentMonthIndex < monthlyData.length - 1) {
    setCurrentMonth(currentMonth + 1);
    // }
  };

  const handleCategoryClick = (category: CategoryType) => {
    setSelectedCategory(category);
    setIsDialogOpen(true);
  };

  const handleSummaryCardClick = (category: CategoryType) => {
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

  const enabledTransactionsDialog = !isLoading && data?.transactions && selectedCategory;

  return (
    <Layout>
      <Container maxWidth="xl">
        <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" fontWeight="bold" py={2}>
            Finance Dashboard
          </Typography>

          <MonthSelector
            displayMonth={`${monthNames[currentMonth]} ${currentYear}`}
            onPreviousMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
            disablePrevious={false} // TODO
            disableNext={isMaxMonth}
            variant="plain"
          />
        </Grid>
      </Container>

      <Container maxWidth="xl" component="main" sx={{ mb: 12 }}>
        <Grid container spacing={3}>
          {/* Summary Cards */}
          <Grid item xs={12}>
            <Grid container spacing={2}>
              {data?.categories.map(data => (
                <Grid item xs={6} md={3} key={data.category}>
                  <SummaryCard
                    isLoading={isLoading}
                    category={data.category}
                    amount={data.amount}
                    count={data.count}
                    onClick={() => handleSummaryCardClick(data.category)}
                    selected={data.category === selectedCategory}
                  />
                </Grid>
              ))}
            </Grid>
          </Grid>

          {/* Charts Section */}
          <Grid item xs={12} md={6}>
            <SpendingBreakdown
              isLoading={isLoading}
              categoryData={data?.categories}
              handleCategoryClick={handleCategoryClick}
              selectedCategory={selectedCategory}
            />
          </Grid>

          {/* <Grid item xs={12} md={6}>
            <MonthComparison data={monthlyData} currentMonthIndex={currentMonthIndex} />
          </Grid> */}
        </Grid>
      </Container>

      {/* Add Expense Button */}
      <AddExpenseButton onAddExpense={handleAddExpense} position="bottom-right" />

      {enabledTransactionsDialog && (
        <TransactionsDialog
          open={isDialogOpen}
          onClose={handleCloseDialog}
          transactions={data.transactions}
          selectedCategory={selectedCategory}
        />
      )}
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
