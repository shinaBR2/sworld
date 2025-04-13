import { graphql } from '../../../graphql';
import { GetMonthlyComparisonQuery, GetMonthlyComparisonQueryVariables } from '../../../graphql/graphql';
import { useRequest } from '../../../universal/hooks/use-request';

const monthlyComparisonQuery = graphql(/* GraphQL */ `
  query GetMonthlyComparison {
    monthly_totals: finance_transactions_aggregate(order_by: { year: desc, month: desc }) {
      nodes {
        month
        year
      }
      aggregate {
        sum {
          amount
        }
        count
      }
    }
  }
`);

interface LoadMonthlyComparisonProps {
  getAccessToken: () => Promise<string>;
  month: number;
  year: number;
}

const useLoadMonthlyComparison = (props: LoadMonthlyComparisonProps) => {
  const { getAccessToken, month, year } = props;

  const { data, isLoading, error } = useRequest<GetMonthlyComparisonQuery, GetMonthlyComparisonQueryVariables>({
    queryKey: ['finance-transactions', month, year],
    getAccessToken,
    document: monthlyComparisonQuery,
  });

  return {
    videos: data?.monthly_totals || [],
    isLoading,
    error,
  };
};

export { useLoadMonthlyComparison };
