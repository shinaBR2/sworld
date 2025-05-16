import { JournalEdit } from '../journal-edit';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import { Journal } from 'core/journal';

interface EditDialogProps {
  open: boolean;
  onClose: () => void;
  journalDetail: Journal | null;
  isLoadingDetail: boolean;
  createJournal: any;
  updateJournal: any;
  onSave: (journal: Journal) => void;
}

const EditDialog = (props: EditDialogProps) => {
  const { open, onClose, journalDetail, isLoadingDetail, createJournal, updateJournal, onSave } = props;

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
          journal={journalDetail}
          isLoading={isLoadingDetail}
          isSaving={createJournal.isPending || updateJournal.isPending}
          onBackClick={onClose}
          onSave={onSave}
        />
      </DialogContent>
    </Dialog>
  );
};

export { EditDialog };
