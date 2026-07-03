import { createLazyFileRoute } from '@tanstack/react-router';
import type { Journal } from 'core/journal';
import { useCreateJournal } from 'core/journal/mutation-hooks';
import { useLoadJournalsByMonth } from 'core/journal/query-hooks';
import { useAuthContext } from 'core/providers/auth';
import { getCurrentMonthYear } from 'core/universal/common';
import { lazy, Suspense, useState } from 'react';
import { FabButton } from 'ui/journal/fab-button';
import { JournalList } from 'ui/journal/journal-list';
import { AuthRoute } from 'ui/universal/authRoute';
import { Container } from 'ui/universal/containers/generic';
import { Layout } from '../components/layout';

const EditDialog = lazy(() =>
  import('ui/journal/edit-dialog').then((m) => ({ default: m.EditDialog })),
);
const Notification = lazy(() =>
  import('ui/universal/notification').then((m) => ({
    default: m.Notification,
  })),
);

// The month list. Clicking a day navigates to its own route (`/journal/$date`)
// instead of switching an in-page `view` — that's what makes the browser back
// button work (SWO-341). This route only lists + creates; viewing/editing a day
// lives on the day route.
const JournalPage = () => {
  const { getAccessToken } = useAuthContext();
  const navigate = Route.useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    severity: 'success' | 'error';
  } | null>(null);

  const defaultDate = getCurrentMonthYear();
  const [month, setMonth] = useState(defaultDate.month);
  const [year, setYear] = useState(defaultDate.year);

  const { data: journalData, isLoading: isLoadingJournals } =
    useLoadJournalsByMonth({
      getAccessToken,
      month,
      year,
    });

  const createMutation = useCreateJournal({
    onSuccess: () => {
      setDialogOpen(false);
      setNotification({
        message: 'Journal entry created successfully',
        severity: 'success',
      });
    },
    onError: () => {
      // One entry per day is DB-enforced — a same-day create is rejected.
      setNotification({
        message:
          'Could not create the entry — there may already be one for that day.',
        severity: 'error',
      });
    },
  });

  const handleJournalClick = (journal: Journal) => {
    navigate({ to: '/journal/$date', params: { date: journal.date } });
  };

  const handleMonthChange = (newMonth: number, newYear: number) => {
    setMonth(newMonth);
    setYear(newYear);
  };

  const handleSave = (input: any) => {
    createMutation.mutate({ object: input });
  };

  return (
    <Layout>
      <Container maxWidth="sm" sx={{ pb: 8, position: 'relative' }}>
        <JournalList
          journals={journalData?.journals || []}
          stats={
            journalData?.stats || {
              categories: [],
              oldest: { month: 0, year: 0 },
            }
          }
          isLoading={isLoadingJournals}
          month={month}
          year={year}
          onJournalClick={handleJournalClick}
          onMonthChange={handleMonthChange}
        />

        <FabButton onClick={() => setDialogOpen(true)} />

        <Suspense fallback={null}>
          <EditDialog
            journalDetail={null}
            isLoadingDetail={false}
            open={dialogOpen}
            onClose={() => setDialogOpen(false)}
            isSaving={createMutation.isPending}
            onSave={handleSave}
          />
        </Suspense>

        <Suspense fallback={null}>
          {notification && (
            <Notification
              notification={notification}
              onClose={() => setNotification(null)}
            />
          )}
        </Suspense>
      </Container>
    </Layout>
  );
};

export const Route = createLazyFileRoute('/journal')({
  component: () => {
    return (
      <AuthRoute>
        <JournalPage />
      </AuthRoute>
    );
  },
});
