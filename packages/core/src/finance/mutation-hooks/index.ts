import { graphql } from '../../graphql';
import {
  CreateFinanceRecordMutation,
  CreateFinanceRecordMutationVariables,
  DeleteFinanceRecordMutation,
  DeleteFinanceRecordMutationVariables,
  UpdateFinanceRecordMutation,
  UpdateFinanceRecordMutationVariables,
} from '../../graphql/graphql';
import { useMutationRequest } from '../../universal/hooks/useMutation';

const createRecord = graphql(/* GraphQL */ `
  mutation CreateFinanceRecord($object: finance_transactions_insert_input!) {
    insert_finance_transactions_one(object: $object) {
      id
      name
      amount
      month
      year
      category
      createdAt
    }
  }
`);

const updateRecord = graphql(/* GraphQL */ `
  mutation UpdateFinanceRecord($id: uuid!, $object: finance_transactions_set_input!) {
    update_finance_transactions_by_pk(pk_columns: { id: $id }, _set: $object) {
      id
      name
      amount
      month
      year
      category
      updatedAt
    }
  }
`);

const deleteRecord = graphql(/* GraphQL */ `
  mutation DeleteFinanceRecord($id: uuid!) {
    delete_finance_transactions_by_pk(id: $id) {
      id
    }
  }
`);

interface MutationProps {
  getAccessToken: () => Promise<string>;
  onSuccess?: (data: CreateFinanceRecordMutation) => void;
  onError?: (error: unknown) => void;
}

const useInsertFinanceTransaction = (props: MutationProps) => {
  const { getAccessToken, onSuccess, onError } = props;

  const { mutateAsync: insertFinanceRecord } = useMutationRequest<
    CreateFinanceRecordMutation,
    CreateFinanceRecordMutationVariables
  >({
    document: createRecord,
    getAccessToken,
    options: {
      onSuccess,
      onError: error => {
        console.error('Bulk convert videos failed:', error);
        onError?.(error);
      },
    },
  });

  return insertFinanceRecord;
};

const useUpdateFinanceTransaction = (props: MutationProps) => {
  const { getAccessToken, onSuccess, onError } = props;

  const { mutateAsync: updateFinanceRecord } = useMutationRequest<
    UpdateFinanceRecordMutation,
    UpdateFinanceRecordMutationVariables
  >({
    document: updateRecord,
    getAccessToken,
    options: {
      onSuccess,
      onError: error => {
        console.error('Bulk convert videos failed:', error);
        onError?.(error);
      },
    },
  });

  return updateFinanceRecord;
};
const useDeleteFinanceTransaction = (props: MutationProps) => {
  const { getAccessToken, onSuccess, onError } = props;

  const { mutateAsync: deleteFinanceRecord } = useMutationRequest<
    DeleteFinanceRecordMutation,
    DeleteFinanceRecordMutationVariables
  >({
    document: deleteRecord,
    getAccessToken,
    options: {
      onSuccess,
      onError: error => {
        console.error('Bulk convert videos failed:', error);
        onError?.(error);
      },
    },
  });

  return deleteFinanceRecord;
};

export { useDeleteFinanceTransaction, useInsertFinanceTransaction, useUpdateFinanceTransaction };
