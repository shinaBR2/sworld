import { JournalEdit } from '../journal-edit';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import { Journal } from 'core/journal';
import { useIsMobile } from '../../universal/responsive';

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
  const isMobile = useIsMobile();

  return (
    <Dialog
      open={open}
      // Prevent closing when clicking backdrop or pressing ESC to avoid losing content
      onClose={(_event, reason) => {
        if (reason === 'backdropClick' || reason === 'escapeKeyDown') {
          return;
        }
        onClose();
      }}
      disableEscapeKeyDown
      keepMounted
      fullWidth
      fullScreen={isMobile}
      maxWidth="sm"
      PaperProps={{
        sx: {
          height: isMobile ? '100vh' : '80vh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: isMobile ? 0 : undefined,
        },
      }}
    >
      <DialogContent sx={{ p: 0, height: '100%', flex: 1, overflow: 'auto' }}>
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

