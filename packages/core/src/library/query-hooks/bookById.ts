import { graphql } from '../../graphql';
import { useAuthContext } from '../../providers/auth';
import { useRequest } from '../../universal/hooks/use-request';

const GET_BOOK_BY_ID = graphql(/* GraphQL */ `
  query GetBookById($id: uuid!) {
    books_by_pk(id: $id) {
      id
      title
      author
      thumbnailUrl
      source
      totalPages
      createdAt
      reading_progresses {
        id
        currentPage
        totalPages
        percentage
        readingTimeMinutes
        lastReadAt
        createdAt
      }
    }
  }
`);

export const useBookById = (id: string) => {
  const { getAccessToken } = useAuthContext();
  const { data, isLoading, error } = useRequest({
    queryKey: ['book', id],
    getAccessToken,
    document: GET_BOOK_BY_ID,
    variables: { id },
  });

  return {
    data,
    isLoading,
    error,
  };
};
