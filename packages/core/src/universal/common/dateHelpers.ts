const formatDate = (dateString: string): string => {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  };
  return new Date(dateString).toLocaleDateString('en-US', options);
};

const formatDateTime = (dateTimeString: string): string => {
  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  };
  return new Date(dateTimeString).toLocaleDateString('en-US', options);
};

const getMonthName = (month: number): string => {
  const date = new Date();
  date.setMonth(month - 1);
  return date.toLocaleString('default', { month: 'long' });
};

const getCurrentMonthYear = (): { month: number; year: number } => {
  const now = new Date();
  return {
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  };
};

const getStartEndDates = (month: number, year: number): { startDate: string; endDate: string } => {
  // Create date for first day of the month
  const startDate = new Date(Date.UTC(year, month - 1, 1))
    .toISOString()
    .split('T')[0];

  // Create date for last day by getting day 0 of next month
  const endDate = new Date(Date.UTC(year, month, 0))
    .toISOString()
    .split('T')[0];

  return { startDate, endDate };
};

export { formatDate, formatDateTime, getCurrentMonthYear, getMonthName, getStartEndDates };
