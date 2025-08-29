import type { CategoryType } from 'core/finance';

const getCategoryIcon = (category: CategoryType) => {
  switch (category) {
    case 'must':
      return '🔴';
    case 'nice':
      return '🔵';
    case 'waste':
      return '🟠';
    case 'total':
      return '💰';
    default:
      return '📊';
  }
};

const getCategoryTitle = (category: CategoryType) => {
  switch (category) {
    case 'must':
      return 'Must';
    case 'nice':
      return 'Nice';
    case 'waste':
      return 'Waste';
    case 'total':
      return 'Total';
    default:
      return 'Expenses';
  }
};

export { getCategoryIcon, getCategoryTitle };
