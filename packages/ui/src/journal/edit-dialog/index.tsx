import { JournalEdit } from '../journal-edit';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import { Journal } from 'core/journal';
import { LoadJournalByIdProps, useLoadJournalById } from 'core/journal/query-hooks';

interface EditDialogProps {
  open: boolean;
  onClose: () => void;
  journalDetail: Journal | null;
  isLoadingDetail: boolean;
  createJournal: any;
  updateJournal: any;
  onSave: (journal: Journal) => void;
}

interface EditDialogPropsWithFetch
  extends Omit<EditDialogProps, 'journalDetail' | 'isLoadingDetail'>,
    LoadJournalByIdProps {}

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

const EditDialogWithFetch = (props: EditDialogPropsWithFetch) => {
  const { id, getAccessToken, ...rest } = props;
  const { data: journalDetail, isLoading: isLoadingDetail } = useLoadJournalById({
    getAccessToken,
    id,
  });

  return <EditDialog {...rest} journalDetail={journalDetail} isLoadingDetail={isLoadingDetail} />;
};

export { EditDialog, EditDialogWithFetch };
