import { expect, test } from '@playwright/test';
import {
  findEntryActions,
  findJournalEntry,
  findJournalsHeading,
  findRecentEntriesHeading,
} from '../locators/journal';
import { MOCK_ENTRY, mockJournalApi, seedAuth } from '../support/fixtures';
import { formatEntryDate } from '../support/format';

// The accessible name of the seeded entry's button, and its own route.
const ENTRY_LABEL = formatEntryDate(MOCK_ENTRY.date);
const DAY_URL = new RegExp(`/journal/${MOCK_ENTRY.date}$`);
const LIST_URL = /\/journal\/?$/;

// Smoke test for the journal flow — the net that catches what types can't: a
// page that throws on first load (SWO-345) or the day route rendering the list
// instead of the day (SWO-346). Auth is a seeded fake Auth0 session and the
// Hasura API is mocked, so nothing here touches a real backend.
test.describe('journal flow', () => {
  test.beforeEach(async ({ context, page }) => {
    await seedAuth(context);
    await mockJournalApi(page);
  });

  test('lists the month, opens a day, and back returns to the list', async ({
    page,
  }) => {
    await page.goto('/journal');

    // The month list renders — not a white screen, not the login dialog.
    await expect(findJournalsHeading(page)).toBeVisible();
    await expect(findRecentEntriesHeading(page)).toBeVisible();
    await expect(
      page.getByText(MOCK_ENTRY.content, { exact: true }),
    ).toBeVisible();

    // Clicking a day goes to its own route AND renders the day page. The
    // "entry actions" button is day-only and only rendered once the entry has
    // loaded (the not-found branch omits it), and the "Recent Entries" heading
    // is list-only — so this pair fails if the day route renders the list
    // (SWO-346) or the entry never loads.
    await findJournalEntry(page, ENTRY_LABEL).click();
    await expect(page).toHaveURL(DAY_URL);
    await expect(findEntryActions(page)).toBeVisible();
    await expect(findRecentEntriesHeading(page)).toBeHidden();

    // The browser back button returns to the list (it's a real route, not an
    // in-page view switch — SWO-341).
    await page.goBack();
    await expect(page).toHaveURL(LIST_URL);
    await expect(findRecentEntriesHeading(page)).toBeVisible();
  });

  test('loads a day directly on refresh', async ({ page }) => {
    await page.goto(`/journal/${MOCK_ENTRY.date}`);
    await expect(findEntryActions(page)).toBeVisible();

    await page.reload();
    await expect(page).toHaveURL(DAY_URL);
    await expect(findEntryActions(page)).toBeVisible();
    await expect(findRecentEntriesHeading(page)).toBeHidden();
  });
});
