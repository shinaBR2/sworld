import { graphql } from '../../graphql';
import { GetCurrentReadingQuery } from '../../graphql/graphql';
import { useRequest } from '../../universal/hooks/use-request';

const GET_CURRENT_READING = graphql(`
  query GetCurrentReading {
    reading_progresses(where: { percentage: { _gt: 0, _lt: 100 } }, order_by: { lastReadAt: desc }, limit: 1) {
      id
      currentPage
      totalPages
      percentage
      lastReadAt
      book {
        id
        title
        totalPages
        thumbnailUrl
      }
    }
  }
`);

const transform = (data: GetCurrentReadingQuery) => {
  const { reading_progresses = [] } = data;
  const progress = reading_progresses[0];

  if (!progress) return null;

  const lastReadDate = new Date(progress.lastReadAt);
  const now = new Date();
  const diffHours = Math.floor((now.getTime() - lastReadDate.getTime()) / (1000 * 60 * 60));

  let lastReadText: string;
  if (diffHours < 1) {
    lastReadText = 'Just now';
  } else if (diffHours < 24) {
    lastReadText = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else {
    const diffDays = Math.floor(diffHours / 24);
    lastReadText = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  }

  return {
    id: progress.book.id,
    title: progress.book.title,
    currentPage: progress.currentPage,
    totalPages: progress.totalPages || progress.book.totalPages || 0,
    lastReadAt: lastReadText,
    coverUrl: progress.book.thumbnailUrl,
  };
};

const useCurrentReading = () => {
  const { data, isLoading, error } = useRequest({
    queryKey: ['current-reading'],
    document: GET_CURRENT_READING,
  });

  return {
    data: !isLoading && data ? transform(data) : null,
    isLoading,
    error,
  };
};

export { useCurrentReading };
