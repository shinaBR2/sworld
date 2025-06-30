import { graphql } from '../../graphql';
import { useAuthContext } from '../../providers/auth';
import { useQueryContext } from '../../providers/query';
import { useMutationRequest } from '../../universal/hooks/useMutation';

const saveProgressMutation = graphql(/* GraphQL */ `
  mutation UpsertReadingProgress($bookId: uuid!, $currentPage: Int!, $totalPages: Int, $readingTimeMinutes: Int) {
    insert_reading_progresses_one(
      object: {
        bookId: $bookId
        currentPage: $currentPage
        totalPages: $totalPages
        readingTimeMinutes: $readingTimeMinutes
        lastReadAt: "now()"
      }
      on_conflict: {
        constraint: reading_progresses_user_id_book_id_key
        update_columns: [currentPage, readingTimeMinutes, lastReadAt]
      }
    ) {
      id
      currentPage
      percentage
      lastReadAt
    }
  }
`);

interface MutationProps {
  onSuccess?: (data: any) => void;
  onError?: (error: unknown) => void;
}

const useSaveProgress = (props: MutationProps) => {
  const { getAccessToken } = useAuthContext();
  const { invalidateQuery } = useQueryContext();
  const { onSuccess, onError } = props;

  const { mutateAsync: saveProgress } = useMutationRequest({
    document: saveProgressMutation,
    getAccessToken,
    options: {
      onSuccess: (data, variables) => {
        const bookId = variables.bookId;

        invalidateQuery(['books']);
        invalidateQuery(['current-reading']);
        invalidateQuery(['reading-stats']);
        invalidateQuery(['book', bookId]);
        onSuccess?.(data);
      },
      onError: error => {
        console.error('Save progress failed:', error);
        onError?.(error);
      },
    },
  });

  return saveProgress;
};

export { useSaveProgress };
