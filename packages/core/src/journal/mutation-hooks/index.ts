import { graphql } from '../../graphql';
import { useAuthContext } from '../../providers/auth';
import { useQueryContext } from '../../providers/query';
import { useMutationRequest } from '../../universal/hooks/useMutation';

const createJournalMutation = graphql(/* GraphQL */ `
  mutation CreateJournal($object: journals_insert_input!) {
    insert_journals_one(object: $object) {
      id
      date
      content
      mood
      tags
      createdAt
      updatedAt
    }
  }
`);

const updateJournalMutation = graphql(/* GraphQL */ `
  mutation UpdateJournal($id: uuid!, $set: journals_set_input!) {
    update_journals_by_pk(pk_columns: { id: $id }, _set: $set) {
      id
      date
      content
      mood
      tags
      updatedAt
    }
  }
`);

const deleteJournalMutation = graphql(/* GraphQL */ `
  mutation DeleteJournal($id: uuid!) {
    delete_journals_by_pk(id: $id) {
      id
      date
    }
  }
`);

interface MutationProps {
  onSuccess?: (data: any) => void;
  onError?: (error: unknown) => void;
}

// Helper function to extract month and year from date string
const getMonthYearFromDate = (dateString?: string) => {
  if (!dateString) return null;

  const [yearStr, monthStr] = dateString.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);

  if (isNaN(year) || isNaN(month)) return null;
  return { month, year };
};

// Helper function to invalidate journal queries
const invalidateJournalQueries = (
  invalidateQuery: (queryKey: unknown[]) => void,
  date?: string,
  journalId?: string,
) => {
  const dateInfo = getMonthYearFromDate(date);

  if (dateInfo) {
    invalidateQuery(['journals', dateInfo.month, dateInfo.year]);
  }

  if (journalId) {
    invalidateQuery(['journal', journalId]);
  }
};

const useCreateJournal = (props: MutationProps) => {
  const { getAccessToken } = useAuthContext();
  const { invalidateQuery } = useQueryContext();
  const { onSuccess, onError } = props;

  const { mutateAsync: createJournal } = useMutationRequest({
    document: createJournalMutation,
    getAccessToken,
    options: {
      onSuccess: (data) => {
        const journalDate = data.insert_journals_one?.date;
        const journalId = data.insert_journals_one?.id;

        invalidateJournalQueries(invalidateQuery, journalDate, journalId);
        onSuccess?.(data);
      },
      onError: (error) => {
        console.error('Create journal failed:', error);
        onError?.(error);
      },
    },
  });

  return createJournal;
};

const useUpdateJournal = (props: MutationProps) => {
  const { getAccessToken } = useAuthContext();
  const { invalidateQuery } = useQueryContext();
  const { onSuccess, onError } = props;

  const { mutateAsync: updateJournal } = useMutationRequest({
    document: updateJournalMutation,
    getAccessToken,
    options: {
      onSuccess: (data) => {
        const journalDate = data.update_journals_by_pk?.date;
        const journalId = data.update_journals_by_pk?.id;

        invalidateJournalQueries(invalidateQuery, journalDate, journalId);
        onSuccess?.(data);
      },
      onError: (error) => {
        console.error('Update journal failed:', error);
        onError?.(error);
      },
    },
  });

  return updateJournal;
};

const useDeleteJournal = (props: MutationProps) => {
  const { getAccessToken } = useAuthContext();
  const { invalidateQuery } = useQueryContext();
  const { onSuccess, onError } = props;

  const { mutateAsync: deleteJournal } = useMutationRequest({
    document: deleteJournalMutation,
    getAccessToken,
    options: {
      onSuccess: (data) => {
        const journalDate = data.delete_journals_by_pk?.date;
        const journalId = data.delete_journals_by_pk?.id;

        invalidateJournalQueries(invalidateQuery, journalDate, journalId);
        onSuccess?.(data);
      },
      onError: (error) => {
        console.error('Delete journal failed:', error);
        onError?.(error);
      },
    },
  });

  return deleteJournal;
};

export { useCreateJournal, useDeleteJournal, useUpdateJournal };
