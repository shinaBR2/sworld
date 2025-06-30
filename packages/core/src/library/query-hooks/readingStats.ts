import { graphql } from '../../graphql';
import { useRequest } from '../../universal/hooks/use-request';
import { GetReadingStatsQuery } from '../../graphql/graphql';

const GET_READING_STATS = graphql(/* GraphQL */ `
  query GetReadingStats {
    books_aggregate {
      aggregate {
        count
      }
    }
    completed_books: books_aggregate(where: { reading_progresses: { percentage: { _gte: 100 } } }) {
      aggregate {
        count
      }
    }
    currently_reading: books_aggregate(where: { reading_progresses: { percentage: { _gt: 0, _lt: 100 } } }) {
      aggregate {
        count
      }
    }
    reading_time_this_month: reading_progresses_aggregate(where: { lastReadAt: { _gte: "2024-01-01" } }) {
      aggregate {
        sum {
          readingTimeMinutes
        }
      }
    }
  }
`);

const transform = (data: GetReadingStatsQuery) => {
  const { books_aggregate, completed_books, currently_reading, reading_time_this_month } = data;
  const totalBooks = books_aggregate.aggregate?.count || 0;
  const completedBooks = completed_books.aggregate?.count || 0;
  const currentlyReading = currently_reading.aggregate?.count || 0;
  const readingTimeThisMonth = reading_time_this_month.aggregate?.sum?.readingTimeMinutes || 0;

  return {
    totalBooks,
    completedBooks,
    currentlyReading,
    readingTimeThisMonth,
  };
};

const useReadingStats = () => {
  const { data, isLoading, error } = useRequest({
    queryKey: ['reading-stats'],
    document: GET_READING_STATS,
  });

  return {
    data: !isLoading && data ? transform(data) : null,
    isLoading,
    error,
  };
};

export { useReadingStats };
