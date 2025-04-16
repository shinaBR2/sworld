// apps/main/src/routes/journal.lazy.tsx
import React, { useState } from 'react';
import { createLazyFileRoute } from '@tanstack/react-router';
import { useLoadJournalsByMonth, useLoadJournalById } from 'core/journal/query-hooks';
import { useCreateJournal, useUpdateJournal, useDeleteJournal } from 'core/journal/mutation-hooks';
import { getCurrentMonthYear } from 'core/universal/common';
import { JournalList } from 'ui/journal/journal-list';
import { JournalDetail } from 'ui/journal/journal-detail';
import { EditDialog } from 'ui/journal/edit-dialog';
import { FabButton } from 'ui/journal/fab-button';
import { Container } from 'ui/universal/containers/generic';
// import Snackbar from '@mui/material/Snackbar';
// import Alert from '@mui/material/Alert';
import { useAuthContext } from 'core/providers/auth';
import { Journal } from 'core/journal';

export const Route = createLazyFileRoute('/journal')({
  component: JournalPage,
});

function JournalPage() {
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

  const { data: journalDetail, isLoading: isLoadingDetail } = useLoadJournalById({
    getAccessToken,
    id: selectedJournal?.id || '',
    // Skip fetching if there's no selected journal or not in detail view
    enabled: !!selectedJournal?.id && view === 'detail',
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

  const handleDelete = () => {
    if (selectedJournal?.id) {
      if (window.confirm('Are you sure you want to delete this journal entry?')) {
        deleteJournal.mutate(selectedJournal.id);
      }
    }
  };

  const handleSave = (input: any) => {
    if (selectedJournal?.id) {
      updateJournal.mutate({ id: selectedJournal.id, input });
    } else {
      createJournal.mutate(input);
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
        return (
          <JournalDetail
            journal={journalDetail || selectedJournal}
            isLoading={isLoadingDetail}
            onBackClick={handleBackToList}
            onEditClick={handleEdit}
            onDeleteClick={handleDelete}
          />
        );
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
    <Container maxWidth="sm" sx={{ pb: 8, position: 'relative' }}>
      {renderContent()}

      {/* FAB for creating new journal entry */}
      {view === 'list' && <FabButton onClick={handleCreateNew} />}

      {/* Edit Dialog */}
      <EditDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        selectedJournal={selectedJournal}
        journalDetail={journalDetail}
        isLoadingDetail={isLoadingDetail}
        createJournal={createJournal}
        updateJournal={updateJournal}
        onSave={handleSave}
      />

      {/* Notifications */}
      {/* <Snackbar
        open={!!notification}
        autoHideDuration={5000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {notification && (
          <Alert severity={notification.severity} onClose={handleCloseNotification} variant="filled">
            {notification.message}
          </Alert>
        )}
      </Snackbar> */}
    </Container>
  );
}
