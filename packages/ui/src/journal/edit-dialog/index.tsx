import { JournalEdit } from '../journal-edit';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import { Journal } from 'core/journal';

interface EditDialogProps {
  open: boolean;
  onClose: () => void;
  selectedJournal: Journal | null;
  journalDetail: Journal | null;
  isLoadingDetail: boolean;
  createJournal: any;
  updateJournal: any;
  onSave: (journal: Journal) => void;
}

const EditDialog = (props: EditDialogProps) => {
  const { open, onClose, selectedJournal, journalDetail, isLoadingDetail, createJournal, updateJournal, onSave } =
    props;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: { height: '80vh' },
      }}
    >
      <DialogContent sx={{ p: 0, height: '100%' }}>
        <JournalEdit
          journal={journalDetail || selectedJournal}
          isLoading={isLoadingDetail && !!selectedJournal}
          isSaving={createJournal.isPending || updateJournal.isPending}
          onBackClick={onClose}
          onSave={onSave}
        />
      </DialogContent>
    </Dialog>
  );
};

export { EditDialog };
