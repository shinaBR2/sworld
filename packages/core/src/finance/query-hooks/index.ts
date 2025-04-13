import { graphql } from '../../graphql';
import { GetFinanceRecordsQuery, GetFinanceRecordsQueryVariables } from '../../graphql/graphql';
import { useRequest } from '../../universal/hooks/use-request';

const transactionsByPeriodQuery = graphql(/* GraphQL */ `
  query GetFinanceRecords($month: Int!, $year: Int!) {
    finance_transactions(where: { month: { _eq: $month }, year: { _eq: $year } }, order_by: { createdAt: desc }) {
      id
      name
      amount
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
  }
`);

interface LoadTransactionsByPeriodProps {
  getAccessToken: () => Promise<string>;
  month: number;
  year: number;
}

const transform = (data: GetFinanceRecordsQuery) => {
  const { finance_transactions, must_aggregate, nice_aggregate, waste_aggregate } = data;
  const mustAmount = must_aggregate.aggregate?.sum?.amount || 0;
  const niceAmount = nice_aggregate.aggregate?.sum?.amount || 0;
  const wasteAmount = waste_aggregate.aggregate?.sum?.amount || 0;
  const totalAmount = mustAmount + niceAmount + wasteAmount;

  const mustCount = must_aggregate.aggregate?.count || 0;
  const niceCount = nice_aggregate.aggregate?.count || 0;
  const wasteCount = waste_aggregate.aggregate?.count || 0;
  const totalCount = mustCount + niceCount + wasteCount;
  const must = {
    amount: mustAmount,
    count: mustCount,
  };
  const nice = {
    amount: niceAmount,
    count: niceCount,
  };
  const waste = {
    amount: wasteAmount,
    count: wasteCount,
  };
  const total = {
    amount: totalAmount,
    count: totalCount,
  };

  return {
    transactions: finance_transactions,
    must,
    nice,
    waste,
    total,
  };
};

const useLoadTransactionsByPeriod = (props: LoadTransactionsByPeriodProps) => {
  const { getAccessToken, month, year } = props;

  const { data, isLoading, error } = useRequest<GetFinanceRecordsQuery, GetFinanceRecordsQueryVariables>({
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
