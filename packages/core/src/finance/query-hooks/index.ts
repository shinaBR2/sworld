import { graphql } from '../../graphql';
import type {
  GetFinanceRecordsQuery,
  GetFinanceRecordsQueryVariables,
} from '../../graphql/graphql';
import { useRequest } from '../../universal/hooks/use-request';
import type { CategoryType } from '../types';

const transactionsByPeriodQuery = graphql(/* GraphQL */ `
  query GetFinanceRecords($month: Int!, $year: Int!) {
    finance_transactions(where: { month: { _eq: $month }, year: { _eq: $year } }, order_by: { createdAt: desc }) {
      id
      name
      amount
      note
      month
      year
      category
      createdAt
      updatedAt
    }
    must_aggregate: finance_transactions_aggregate(
      where: { month: { _eq: $month }, year: { _eq: $year }, category: { _eq: "must" } }
    ) {
      aggregate {
        count
        sum {
          amount
        }
      }
    }
    nice_aggregate: finance_transactions_aggregate(
      where: { month: { _eq: $month }, year: { _eq: $year }, category: { _eq: "nice" } }
    ) {
      aggregate {
        count
        sum {
          amount
        }
      }
    }
    waste_aggregate: finance_transactions_aggregate(
      where: { month: { _eq: $month }, year: { _eq: $year }, category: { _eq: "waste" } }
    ) {
      aggregate {
        count
        sum {
          amount
        }
      }
    }
    oldest_aggregate: finance_transactions(order_by: { year: asc, month: asc }, limit: 1) {
      year
      month
    }
  }
`);

interface LoadTransactionsByPeriodProps {
  getAccessToken: () => Promise<string>;
  month: number;
  year: number;
}

const transform = (data: GetFinanceRecordsQuery) => {
  const {
    finance_transactions = [],
    must_aggregate,
    nice_aggregate,
    waste_aggregate,
    oldest_aggregate,
  } = data;
  const mustAmount = (must_aggregate.aggregate?.sum?.amount ?? 0) as number;
  const niceAmount = (nice_aggregate.aggregate?.sum?.amount ?? 0) as number;
  const wasteAmount = (waste_aggregate.aggregate?.sum?.amount ?? 0) as number;
  const totalAmount = mustAmount + niceAmount + wasteAmount;

  const mustCount = must_aggregate.aggregate?.count ?? 0;
  const niceCount = nice_aggregate.aggregate?.count ?? 0;
  const wasteCount = waste_aggregate.aggregate?.count ?? 0;
  const totalCount = mustCount + niceCount + wasteCount;

  return {
    transactions: finance_transactions,
    categories: [
      {
        category: 'must' as CategoryType,
        amount: mustAmount,
        count: mustCount,
      },
      {
        category: 'nice' as CategoryType,
        amount: niceAmount,
        count: niceCount,
      },
      {
        category: 'waste' as CategoryType,
        amount: wasteAmount,
        count: wasteCount,
      },
      {
        category: 'total' as CategoryType,
        amount: totalAmount,
        count: totalCount,
      },
    ],
    oldest: {
      month: oldest_aggregate[0]?.month || 0,
      year: oldest_aggregate[0]?.year || 0,
    },
  };
};

const useLoadTransactionsByPeriod = (props: LoadTransactionsByPeriodProps) => {
  const { getAccessToken, month, year } = props;

  const { data, isLoading, error } = useRequest<
    GetFinanceRecordsQuery,
    GetFinanceRecordsQueryVariables
  >({
    queryKey: ['finance-transactions', month, year],
    getAccessToken,
    document: transactionsByPeriodQuery,
    variables: {
      month,
      year,
    },
  });

  return {
    data: !isLoading && data ? transform(data) : null,
    isLoading,
    error,
  };
};

export { useLoadTransactionsByPeriod };
