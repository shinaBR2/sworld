import { createLazyFileRoute } from '@tanstack/react-router';
import React, { lazy, useState } from 'react';
import { Layout } from '../components/layout';
import { Container, Grid, Typography } from 'ui/universal/containers/generic';
import { SummaryCard } from 'ui/main/home-page/summary-card';
// import { MonthComparison } from 'ui/main/home-page/month-comparison';
import { SpendingBreakdown } from 'ui/main/home-page/spending-breakdown';
import { AddExpenseButtonProps, ExpenseFormData } from 'ui/main/home-page/add-button';
import { MonthSelector } from 'ui/main/home-page/month-selector';
import { TransactionsDialogProps } from 'ui/main/home-page/transactions-dialog';
import { useAuthContext } from 'core/providers/auth';
import { useLoadTransactionsByPeriod } from 'core/finance/query-hooks';
import { useInsertFinanceTransaction } from 'core/finance/mutation-hooks';
import { LoginDialogProps } from 'ui/universal/dialogs/login';
import { CategoryType } from 'core/finance';
import { useQueryContext } from 'core/providers/query';
import { LoadingBackdrop } from 'ui/universal';

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

const AddExpenseButton = lazy(() =>
  import('ui/main/home-page/add-button').then(module => {
    const Component = module.AddExpenseButton;
    return { default: (props: AddExpenseButtonProps) => <Component {...props} /> };
  })
);

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const currentDate = new Date();
const initialMonth = currentDate.getMonth();
const initialYear = currentDate.getFullYear();

const Content = () => {
  const { getAccessToken } = useAuthContext();
  const { invalidateQuery } = useQueryContext();
  const [currentMonth, setCurrentMonth] = useState(initialMonth);
  const [currentYear, setCurrentYear] = useState(initialYear);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data, isLoading } = useLoadTransactionsByPeriod({
    month: currentMonth,
    year: currentYear,
    getAccessToken: getAccessToken,
  });
  const addExpense = useInsertFinanceTransaction({
    getAccessToken,
    onSuccess: () => {
      invalidateQuery(['finance-transactions', currentMonth, currentYear]);
      setIsDialogOpen(false);
    },
  });

  const minMonth = data?.oldest.month || 0;
  const minYear = data?.oldest.year || 0;

  console.log(`min month`, minMonth, minYear);
  console.log(`current`, currentMonth, currentYear);
  const isMaxMonth = currentMonth === initialMonth && currentYear === initialYear;
  const isMinMonth = currentMonth === minMonth && currentYear === minYear;

  const handlePrevMonth = () => {
    if (isLoading) {
      return;
    }

    if (isMinMonth) {
      return;
    }

    if (currentMonth === 0) {
      // If January, go to December of previous year
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (isLoading) {
      return;
    }

    if (isMaxMonth) {
      return;
    }

    if (currentMonth === 11) {
      // If December, go to January of next year
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
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

  const handleAddExpense = async (expenseData: ExpenseFormData) => {
    await addExpense({
      object: {
        ...expenseData,
        month: initialMonth,
        year: initialYear,
      },
    });
  };

  const enabledTransactionsDialog = !isLoading && data?.transactions && selectedCategory;
  // This is a temporary solution for the loading state
  const categories = isLoading
    ? [
        { category: 'must' as CategoryType, amount: 0, count: 0 },
        { category: 'nice' as CategoryType, amount: 0, count: 0 },
        { category: 'waste' as CategoryType, amount: 0, count: 0 },
        { category: 'total' as CategoryType, amount: 0, count: 0 },
      ]
    : data?.categories;

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
              {categories?.map(data => (
                <Grid item xs={6} md={3} key={data.category}>
                  <SummaryCard
                    isLoading={isLoading} // TODO: handle loading state
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
    return <LoadingBackdrop message="Valuable things deserve waiting" />;
  }
  if (!isSignedIn) {
    return <LoginDialog onAction={signIn} />;
  }

  return <Content />;
};

export const Route = createLazyFileRoute('/finance')({
  component: RouteComponent,
});
