import type { Page } from '@playwright/test';

// Semantic finders for the journal pages. Chosen by role, never DOM structure:
// the month-list headings are headings, a journal entry is a button (its
// accessible name is the formatted date), and the day page's overflow menu is
// the "entry actions" button — which exists ONLY on the day page, so its
// presence distinguishes the day route from the list (the SWO-346 regression).
const findJournalsHeading = (page: Page) =>
  page.getByRole('heading', { name: 'Journals', exact: true });

const findRecentEntriesHeading = (page: Page) =>
  page.getByRole('heading', { name: 'Recent Entries', exact: true });

const findJournalEntry = (page: Page, name: string) =>
  page.getByRole('button', { name, exact: true });

const findEntryActions = (page: Page) =>
  page.getByRole('button', { name: 'entry actions', exact: true });

export {
  findEntryActions,
  findJournalEntry,
  findJournalsHeading,
  findRecentEntriesHeading,
};
