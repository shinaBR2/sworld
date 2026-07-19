import type { GetFinanceRecordsQuery } from '../graphql/graphql';

type CategoryType = 'must' | 'nice' | 'waste' | 'total';

// A quick-fill preset for the Add Expense dialog. `title` is the chip label —
// distinct from `note` (usually equal, not always). No month/year: those come
// from the page's current period on insert.
type Template = GetFinanceRecordsQuery['finance_transaction_templates'][number];

export type { CategoryType, Template };
