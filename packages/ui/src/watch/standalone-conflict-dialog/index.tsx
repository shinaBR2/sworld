import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

interface StandaloneConflictDialogProps {
  open: boolean;
  deviceMode: boolean;
  accountMode: boolean;
  onChoose: (mode: boolean) => void;
  saving?: boolean;
}

const modeLabel = (mode: boolean) =>
  mode ? 'Standalone (no URL)' : 'Normal (with URL)';

// A cross-device conflict is resolved by an explicit choice, so the dialog is
// intentionally not dismissible (no backdrop/escape close, no cancel) — leaving
// the two stores divergent would re-open it on every load.
const StandaloneConflictDialog = (props: StandaloneConflictDialogProps) => {
  const { open, deviceMode, accountMode, onChoose, saving } = props;

  return (
    <Dialog
      open={open}
      disableEscapeKeyDown
      aria-labelledby="standalone-conflict-title"
    >
      <DialogTitle id="standalone-conflict-title">
        Which mode do you want?
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          This device and your account disagree on Standalone mode. Pick which
          one to keep — it will apply everywhere.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onChoose(deviceMode)} disabled={saving}>
          This device: {modeLabel(deviceMode)}
        </Button>
        <Button
          onClick={() => onChoose(accountMode)}
          disabled={saving}
          variant="contained"
        >
          Account: {modeLabel(accountMode)}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export { StandaloneConflictDialog };
