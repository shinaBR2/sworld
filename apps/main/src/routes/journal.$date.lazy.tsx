import { createLazyFileRoute } from '@tanstack/react-router';
import {
  useCreateJournal,
  useDeleteJournal,
  useUpdateJournal,
} from 'core/journal/mutation-hooks';
import { useLoadJournalByDate } from 'core/journal/query-hooks';
import { useAuthContext } from 'core/providers/auth';
import { useQueryContext } from 'core/providers/query';
import { lazy, Suspense, useState } from 'react';
import { JournalDetail } from 'ui/journal/journal-detail';
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

// One day's journal entry, as its own route (`/journal/2026-03-18`). Because
// this is a real route rather than an in-page state switch, the browser back
// button returns to the month list and the day is bookmarkable / refresh-safe
// (SWO-341).
const JournalDayPage = () => {
  const { date } = Route.useParams();
  const navigate = Route.useNavigate();
  const { getAccessToken } = useAuthContext();
  const { invalidateQuery } = useQueryContext();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    severity: 'success' | 'error';
  } | null>(null);

  const { data: journal, isLoading } = useLoadJournalByDate({
    getAccessToken,
    date,
  });

  // EditDialog requires both mutations; only update is used here (editing an
  // existing day), but the prop is required so we pass both.
  const createJournal = useCreateJournal({ onSuccess: () => {} });
  const updateJournal = useUpdateJournal({
    onSuccess: () => {
      setDialogOpen(false);
      invalidateQuery(['journal-by-date', date]);
      setNotification({
        message: 'Journal entry updated successfully',
        severity: 'success',
      });
    },
  });
  const deleteJournal = useDeleteJournal({
    onSuccess: () => {
      navigate({ to: '/journal' });
    },
  });

  const goBack = () => navigate({ to: '/journal' });

  const handleDelete = async () => {
    if (
      journal?.id &&
      window.confirm('Are you sure you want to delete this journal entry?')
    ) {
      await deleteJournal({ id: journal.id });
    }
  };

  const handleSave = async (input: any) => {
    if (journal?.id) {
      await updateJournal({ id: journal.id, set: input });
    }
  };

  return (
    <Layout>
      <Container maxWidth="sm" sx={{ pb: 8, position: 'relative' }}>
        <JournalDetail
          journal={journal}
          isLoading={isLoading}
          onBackClick={goBack}
          onEditClick={() => setDialogOpen(true)}
          onDeleteClick={handleDelete}
        />

        <Suspense fallback={null}>
          <EditDialog
            journalDetail={journal}
            isLoadingDetail={isLoading}
            open={dialogOpen}
            onClose={() => setDialogOpen(false)}
            createJournal={createJournal}
            updateJournal={updateJournal}
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

export const Route = createLazyFileRoute('/journal/$date')({
  component: () => {
    return (
      <AuthRoute>
        <JournalDayPage />
      </AuthRoute>
    );
  },
});
