import { graphql } from '../../graphql';

const allTransactionsQuery = graphql(/* GraphQL */ `
  query GetFinanceRecords {
    finance_transactions(order_by: { createdAt: desc }) {
      id
      name
      amount
      category
      createdAt
      updatedAt
    }
  }
`);

// const GET_FINANCE_SUMMARY = graphql(/* GraphQL */ `
//   query GetFinanceSummary {
//     must_total: finance_transactions_aggregate(where: { category: { _eq: "must" } }) {
//       aggregate {
//         sum {
//           amount
//         }
//       }
//     }
//     nice_total: finance_transactions_aggregate(where: { category: { _eq: "nice" } }) {
//       aggregate {
//         sum {
//           amount
//         }
//       }
//     }
//     waste_total: finance_transactions_aggregate(where: { category: { _eq: "waste" } }) {
//       aggregate {
//         sum {
//           amount
//         }
//       }
//     }
//   }
// `);

// interface LoadFinanceTransactionsProps {
//   getAccessToken: () => Promise<string>;
// }

// const useLoadAllFinanceTransactions = (props: LoadFinanceTransactionsProps) => {
//   const { getAccessToken } = props;

//   const { data, isLoading, error } = useRequest<GetFinanceRecordsQuery>({
//     queryKey: ['finance-transactions'],
//     getAccessToken,
//     document: allTransactionsQuery,
//   });

//   return {
//     videos: data ? transform(data) : [],
//     isLoading,
//     error,
//   };
// };

export { allTransactionsQuery };
