// packages/core/src/journal/mutation-hooks/journals.ts
import { useQueryClient } from '@tanstack/react-query';
import { Auth } from '../..';
import { graphql } from '../../graphql';
import {
  CreateJournalMutation,
  CreateJournalMutationVariables,
  DeleteJournalMutation,
  DeleteJournalMutationVariables,
  UpdateJournalMutation,
  UpdateJournalMutationVariables,
} from '../../graphql/graphql';
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
  getAccessToken: () => Promise<string>;
  onSuccess?: (data: any) => void;
  onError?: (error: unknown) => void;
}

const useCreateJournal = (props: MutationProps) => {
  const { getAccessToken = Auth.useAuthContext().getAccessToken, onSuccess, onError } = props;
  const queryClient = useQueryClient();

  const { mutateAsync: createJournal } = useMutationRequest<CreateJournalMutation, CreateJournalMutationVariables>({
    document: createJournalMutation,
    getAccessToken,
    options: {
      onSuccess: data => {
        const currentDate = new Date();
        const month = currentDate.getMonth() + 1;
        const year = currentDate.getFullYear();

        // Invalidate journals query to refetch the list
        queryClient.invalidateQueries({ queryKey: ['journals', month, year] });

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
  const { getAccessToken = Auth.useAuthContext().getAccessToken, onSuccess, onError } = props;
  const queryClient = useQueryClient();

  const { mutateAsync: updateJournal } = useMutationRequest<UpdateJournalMutation, UpdateJournalMutationVariables>({
    document: updateJournalMutation,
    getAccessToken,
    options: {
      onSuccess: data => {
        // Get month and year from the updated journal's date
        const [year, month] = data.update_journals_by_pk?.date.split('-').map((n: string) => parseInt(n, 10)) || [];

        // Invalidate journals query for the specific month/year
        if (month && year) {
          queryClient.invalidateQueries({ queryKey: ['journals', month, year] });
        }

        // Invalidate the specific journal query
        const journalId = data.update_journals_by_pk?.id;
        if (journalId) {
          queryClient.invalidateQueries({ queryKey: ['journal', journalId] });
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
  const { getAccessToken = Auth.useAuthContext().getAccessToken, onSuccess, onError } = props;
  const queryClient = useQueryClient();

  const { mutateAsync: deleteJournal } = useMutationRequest<DeleteJournalMutation, DeleteJournalMutationVariables>({
    document: deleteJournalMutation,
    getAccessToken,
    options: {
      onSuccess: data => {
        const currentDate = new Date();
        const month = currentDate.getMonth() + 1;
        const year = currentDate.getFullYear();

        // Invalidate journals query to refetch the list
        queryClient.invalidateQueries({ queryKey: ['journals', month, year] });

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
