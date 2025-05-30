export interface ShareDialogProps {
  open: boolean;
  onClose: () => void;
  onShare: (emails: string[]) => void;
}
