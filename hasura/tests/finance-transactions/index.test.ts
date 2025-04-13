import { expect } from "vitest";
import {
  createRoleTestSuite,
  MutationTestCase,
  QueryTestCase,
  ROLE_ANONYMOUS,
  ROLE_USER,
} from "../create-role-test-suite";

// Sample finance record data for testing
const sampleRecord = {
  name: "Test Expense",
  amount: 125.5,
  category: "must",
};

const testState: { financeRecordId?: string } = {};

// Anonymous user shouldn't be able to access finance transactions
const deniedFinanceQueries: QueryTestCase[] = [
  {
    name: "Get finance transactions",
    query: `
      query GetFinanceTransactions {
        finance_transactions {
          id
          name
          amount
          category
        }
      }
    `,
  },
];

const deniedFinanceMutations: MutationTestCase[] = [
  {
    name: "Create finance record",
    mutation: `
      mutation CreateFinanceRecord($name: String!, $amount: numeric!, $category: String!) {
        insert_finance_transactions_one(object: {
          name: $name,
          amount: $amount,
          category: $category
        }) {
          id
          name
          amount
          category
        }
      }
    `,
    variables: sampleRecord,
  },
];

// Authenticated user (ROLE_USER) should be able to access their own finance transactions
const allowedUserQueries: QueryTestCase[] = [
  {
    name: "Get own finance transactions",
    query: `
      query GetFinanceTransactions {
        finance_transactions {
          id
          name
          amount
          category
          createdAt
          updatedAt
        }
      }
    `,
    additionalTest: (response) => {
      // At minimum, the response should have the finance_transactions array
      expect(response).toHaveProperty("finance_transactions");
      expect(Array.isArray(response.finance_transactions)).toBe(true);
    },
  },
  {
    name: "Get finance transactions with aggregates",
    query: `
      query GetFinanceAggregates {
        finance_transactions_aggregate {
          aggregate {
            count
            sum {
              amount
            }
          }
          nodes {
            id
            name
            amount
            category
          }
        }
      }
    `,
    additionalTest: (response) => {
      expect(response).toHaveProperty("finance_transactions_aggregate");
      expect(response.finance_transactions_aggregate).toHaveProperty(
        "aggregate"
      );
      expect(response.finance_transactions_aggregate.aggregate).toHaveProperty(
        "count"
      );
    },
  },
];

const allowedUserMutations: MutationTestCase[] = [
  {
    name: "Create finance record",
    mutation: `
      mutation CreateFinanceRecord($name: String!, $amount: numeric!, $category: String!) {
        insert_finance_transactions_one(object: {
          name: $name,
          amount: $amount,
          category: $category
        }) {
          id
          name
          amount
          category
          createdAt
        }
      }
    `,
    variables: sampleRecord,
    additionalTest: (response) => {
      expect(response).toHaveProperty("insert_finance_transactions_one");
      const record = response.insert_finance_transactions_one;
      expect(record).toHaveProperty("id");
      testState.financeRecordId = record.id; // Store the created ID
    },
  },
  {
    name: "Update finance record",
    mutation: `
      mutation UpdateFinanceRecord($id: uuid!, $name: String!, $amount: numeric!, $category: String!) {
        update_finance_transactions_by_pk(
          pk_columns: { id: $id },
          _set: { name: $name, amount: $amount, category: $category }
        ) {
          id
          name
          amount
          category
        }
      }
    `,
    variables: () => ({
      id: testState.financeRecordId,
      name: "Updated Test Expense",
      amount: 200.75,
      category: "want",
    }),
    additionalTest: (response) => {
      expect(response).toHaveProperty("update_finance_transactions_by_pk");
      const updated = response.update_finance_transactions_by_pk;
      expect(updated.name).toBe("Updated Test Expense");
      expect(parseFloat(updated.amount)).toBe(200.75);
    },
  },
  {
    name: "Delete finance record",
    mutation: `
      mutation DeleteFinanceRecord($id: uuid!) {
        delete_finance_transactions_by_pk(id: $id) {
          id
          name
        }
      }
    `,
    variables: () => ({
      id: testState.financeRecordId,
    }),
    additionalTest: (response) => {
      expect(response).toHaveProperty("delete_finance_transactions_by_pk");
      expect(response.delete_finance_transactions_by_pk.id).toBe(
        testState.financeRecordId
      );
    },
  },
];

// Tests for anonymous users - should be denied all access
await createRoleTestSuite(ROLE_ANONYMOUS, {
  queries: {
    allowed: [],
    denied: [...deniedFinanceQueries],
    empty: [],
  },
  mutations: {
    allowed: [],
    denied: [...deniedFinanceMutations],
  },
});

// Tests for authenticated users - should have proper access
await createRoleTestSuite(ROLE_USER, {
  queries: {
    allowed: [...allowedUserQueries],
    denied: [],
    empty: [],
  },
  mutations: {
    allowed: [...allowedUserMutations],
    denied: [],
  },
});
