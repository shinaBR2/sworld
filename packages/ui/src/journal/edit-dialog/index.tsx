import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import type { Journal } from 'core/journal';
import { useIsMobile } from '../../universal/responsive';
import { JournalEdit } from '../journal-edit';

interface EditDialogProps {
  open: boolean;
  onClose: () => void;
  journalDetail: Journal | null;
  isLoadingDetail: boolean;
  // Whether a save is in flight (create or update, whichever this caller does).
  isSaving: boolean;
  onSave: (journal: Journal) => void;
}

const EditDialog = (props: EditDialogProps) => {
  const { open, onClose, journalDetail, isLoadingDetail, isSaving, onSave } =
    props;
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
      slotProps={{
        paper: {
          sx: {
            // On mobile, `fullScreen` already sizes the paper to the visible
            // viewport. Forcing `100vh` here uses the *large* viewport (behind
            // the address bar), making the dialog taller than the screen and
            // clipping the header — so only set an explicit height on desktop.
            ...(isMobile ? {} : { height: '80vh' }),
            display: 'flex',
            flexDirection: 'column',
            borderRadius: isMobile ? 0 : 3,
          },
        },
      }}
    >
      <DialogContent sx={{ p: 0, height: '100%', flex: 1, overflow: 'auto' }}>
        <JournalEdit
          journal={journalDetail}
          isLoading={isLoadingDetail}
          isSaving={isSaving}
          onBackClick={onClose}
          onSave={onSave}
        />
      </DialogContent>
    </Dialog>
  );
};

export { EditDialog };
