// packages/core/src/journal/mutation-hooks/journals.ts
import { graphql } from '../../graphql';
import {
  CreateJournalMutation,
  CreateJournalMutationVariables,
  DeleteJournalMutation,
  DeleteJournalMutationVariables,
  UpdateJournalMutation,
  UpdateJournalMutationVariables,
} from '../../graphql/graphql';
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
    }
  }
`);

interface MutationProps {
  onSuccess?: (data: any) => void;
  onError?: (error: unknown) => void;
}

const useCreateJournal = (props: MutationProps) => {
  const { getAccessToken } = useAuthContext();
  const { invalidateQuery } = useQueryContext();
  const { onSuccess, onError } = props;

  const { mutateAsync: createJournal } = useMutationRequest<CreateJournalMutation, CreateJournalMutationVariables>({
    document: createJournalMutation,
    getAccessToken,
    options: {
      onSuccess: data => {
        // For now I want to create only for current date
        // Not for the specific date
        const currentDate = new Date();
        const month = currentDate.getMonth() + 1;
        const year = currentDate.getFullYear();

        // Invalidate journals query to refetch the list
        invalidateQuery(['journals', month, year]);

        onSuccess?.(data);
      },
      onError: error => {
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

  const { mutateAsync: updateJournal } = useMutationRequest<UpdateJournalMutation, UpdateJournalMutationVariables>({
    document: updateJournalMutation,
    getAccessToken,
    options: {
      onSuccess: data => {
        // Get month and year from the updated journal's date
        const [year, month] = data.update_journals_by_pk?.date.split('-').map((n: string) => parseInt(n, 10)) || [];

        // Invalidate journals query for the specific month/year
        if (month && year) {
          invalidateQuery(['journals', month, year]);
        }

        // Invalidate the specific journal query
        const journalId = data.update_journals_by_pk?.id;
        if (journalId) {
          invalidateQuery(['journal', journalId]);
        }

        onSuccess?.(data);
      },
      onError: error => {
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

  const { mutateAsync: deleteJournal } = useMutationRequest<DeleteJournalMutation, DeleteJournalMutationVariables>({
    document: deleteJournalMutation,
    getAccessToken,
    options: {
      onSuccess: data => {
        const currentDate = new Date();
        const month = currentDate.getMonth() + 1;
        const year = currentDate.getFullYear();

        // Invalidate journals query to refetch the list
        invalidateQuery(['journals', month, year]);

        onSuccess?.(data);
      },
      onError: error => {
        console.error('Delete journal failed:', error);
        onError?.(error);
      },
    },
  });

  return deleteJournal;
};

export { useCreateJournal, useDeleteJournal, useUpdateJournal };
