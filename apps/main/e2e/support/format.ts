// Mirrors core's formatDate (weekday/month/day, en-US) for computing the
// expected accessible name of a journal entry. `timeZone: 'UTC'` is pinned so
// this Node-side value matches the browser render — the Playwright context runs
// with timezoneId 'UTC', and the app's formatDate parses 'YYYY-MM-DD' as UTC
// midnight. Both therefore produce the same string regardless of the CI TZ.
const formatEntryDate = (isoDate: string) =>
  new Date(`${isoDate}T00:00:00Z`).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });

export { formatEntryDate };
