import React, { useState, lazy, Suspense } from 'react';
import { createLazyFileRoute } from '@tanstack/react-router';
import { useLoadJournalsByMonth } from 'core/journal/query-hooks';
import { useCreateJournal, useUpdateJournal, useDeleteJournal } from 'core/journal/mutation-hooks';
import { getCurrentMonthYear } from 'core/universal/common';
import { JournalList } from 'ui/journal/journal-list';
import { Container } from 'ui/universal/containers/generic';
import { useAuthContext } from 'core/providers/auth';
import { Journal } from 'core/journal';
import { Layout } from '../components/layout';
import { FabButton } from 'ui/journal/fab-button';
import { AuthRoute } from 'ui/universal/authRoute';

// Lazy loaded components
const JournalDetailWithFetch = lazy(() =>
  import('ui/journal/journal-detail').then(m => ({ default: m.JournalDetailWithFetch }))
);
const EditDialogWithFetch = lazy(() =>
  import('ui/journal/edit-dialog').then(m => ({ default: m.EditDialogWithFetch }))
);
const EditDialog = lazy(() => import('ui/journal/edit-dialog').then(m => ({ default: m.EditDialog })));
const Notification = lazy(() => import('ui/journal/notification').then(m => ({ default: m.Notification })));

const JournalPage = () => {
  const { getAccessToken } = useAuthContext();
  const [view, setView] = useState<'list' | 'detail' | 'edit'>('list');
  const [selectedJournal, setSelectedJournal] = useState<Journal | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [notification, setNotification] = useState<{ message: string; severity: 'success' | 'error' } | null>(null);

  // Date navigation state
  const defaultDate = getCurrentMonthYear();
  const [month, setMonth] = useState(defaultDate.month);
  const [year, setYear] = useState(defaultDate.year);

  // Data loading hooks
  const { data: journalData, isLoading: isLoadingJournals } = useLoadJournalsByMonth({
    getAccessToken,
    month,
    year,
  });

  // Mutation hooks
  const createJournal = useCreateJournal({
    onSuccess: () => {
      setDialogOpen(false);
      setView('list');
      setNotification({ message: 'Journal entry created successfully', severity: 'success' });
    },
  });

  const updateJournal = useUpdateJournal({
    onSuccess: () => {
      setDialogOpen(false);
      setView('detail');
      setNotification({ message: 'Journal entry updated successfully', severity: 'success' });
    },
  });

  const deleteJournal = useDeleteJournal({
    onSuccess: () => {
      setDialogOpen(false);
      setView('list');
      setSelectedJournal(null);
      setNotification({ message: 'Journal entry deleted successfully', severity: 'success' });
    },
  });

  // Handler functions
  const handleJournalClick = (journal: Journal) => {
    setSelectedJournal(journal);
    setView('detail');
  };

  const handleMonthChange = (newMonth: number, newYear: number) => {
    setMonth(newMonth);
    setYear(newYear);
  };

  const handleCreateNew = () => {
    setSelectedJournal(null);
    setDialogOpen(true);
  };

  const handleEdit = () => {
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (selectedJournal?.id) {
      if (window.confirm('Are you sure you want to delete this journal entry?')) {
        await deleteJournal({ id: selectedJournal.id });
      }
    }
  };

  const handleSave = async (input: any) => {
    if (selectedJournal?.id) {
      await updateJournal({ id: selectedJournal.id, set: input });
    } else {
      await createJournal({
        object: input,
      });
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleBackToList = () => {
    setView('list');
    setSelectedJournal(null);
  };

  const handleCloseNotification = () => {
    setNotification(null);
  };

  // Render functions
  const renderContent = () => {
    switch (view) {
      case 'detail':
        return selectedJournal?.id ? (
          <Suspense fallback={null}>
            <JournalDetailWithFetch
              id={selectedJournal?.id}
              getAccessToken={getAccessToken}
              onBackClick={handleBackToList}
              onEditClick={handleEdit}
              onDeleteClick={handleDelete}
            />
          </Suspense>
        ) : null;
      default:
        return (
          <JournalList
            journals={journalData?.journals || []}
            stats={journalData?.stats || { categories: [], oldest: { month: 0, year: 0 } }}
            isLoading={isLoadingJournals}
            month={month}
            year={year}
            onJournalClick={handleJournalClick}
            onMonthChange={handleMonthChange}
          />
        );
    }
  };

  return (
    <Layout>
      <Container maxWidth="sm" sx={{ pb: 8, position: 'relative' }}>
        {renderContent()}

        {/* FAB for creating new journal entry */}
        {view === 'list' && <FabButton onClick={handleCreateNew} />}

        {/* Edit Dialog */}
        <Suspense fallback={null}>
          {selectedJournal?.id ? (
            <EditDialogWithFetch
              id={selectedJournal.id}
              getAccessToken={getAccessToken}
              open={dialogOpen}
              onClose={handleCloseDialog}
              createJournal={createJournal}
              updateJournal={updateJournal}
              onSave={handleSave}
            />
          ) : (
            <EditDialog
              open={dialogOpen}
              onClose={handleCloseDialog}
              createJournal={createJournal}
              updateJournal={updateJournal}
              onSave={handleSave}
              journalDetail={null}
              isLoadingDetail={false}
            />
          )}
        </Suspense>

        {/* Notifications */}
        <Suspense fallback={null}>
          {notification && <Notification notification={notification} onClose={handleCloseNotification} />}
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
