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
  }
`);

interface LoadTransactionsByPeriodProps {
  getAccessToken: () => Promise<string>;
  month: number;
  year: number;
}

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
    videos: data?.finance_transactions || [],
    isLoading,
    error,
  };
};

export { useLoadTransactionsByPeriod };
