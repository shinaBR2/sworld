import { graphql } from '../../graphql';
import { GetBooksQuery } from '../../graphql/graphql';
import { useRequest } from '../../universal/hooks/use-request';

const GET_BOOKS = graphql(/* GraphQL */ `
  query GetBooks {
    books {
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

interface UseBooksProps {
  limit?: number;
  offset?: number;
  filter?: 'all' | 'completed' | 'reading' | 'recent';
}

type BookWithProgress = GetBooksQuery['books'][0] & {
  currentProgress?: GetBooksQuery['books'][0]['reading_progresses'][0];
  progressPercentage: number;
  isCompleted: boolean;
  isNew: boolean;
};

const transform = (books: GetBooksQuery['books']): BookWithProgress[] => {
  return books.map(book => {
    const progress = book.reading_progresses?.[0];
    const progressPercentage = progress?.percentage || 0;
    const isCompleted = progressPercentage >= 100;
    const isNew = !progress && new Date(book.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days

    return {
      ...book,
      currentProgress: progress,
      progressPercentage,
      isCompleted,
      isNew,
    };
  });
};

export const useBooks = ({ limit = 50, offset = 0, filter = 'all' }: UseBooksProps = {}) => {
  const { data, isLoading, error } = useRequest({
    queryKey: ['books', limit, offset, filter],
    document: GET_BOOKS,
    // transform: (data) => {
    //   const transformedBooks = transform(data.books);

    //   // Apply filter
    //   switch (filter) {
    //     case 'completed':
    //       return transformedBooks.filter(book => book.isCompleted);
    //     case 'reading':
    //       return transformedBooks.filter(book => book.progressPercentage > 0 && !book.isCompleted);
    //     case 'recent':
    //       return transformedBooks.filter(book => book.isNew);
    //     default:
    //       return transformedBooks;
    //   }
    // },
  });

  return {
    data: !isLoading && data ? transform(data.books) : null,
    isLoading,
    error,
  };
};
