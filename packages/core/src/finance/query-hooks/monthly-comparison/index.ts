import { graphql } from '../../../graphql';
import type { GetMonthlyComparisonQuery } from '../../../graphql/graphql';
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
}

const useLoadMonthlyComparison = (props: LoadMonthlyComparisonProps) => {
  const { getAccessToken } = props;

  const { data, isLoading, error } = useRequest<GetMonthlyComparisonQuery>({
    queryKey: ['monthly_totals'],
    getAccessToken,
    document: monthlyComparisonQuery,
  });

  return {
    data: data?.monthly_totals || [],
    isLoading,
    error,
  };
};

export { useLoadMonthlyComparison };
