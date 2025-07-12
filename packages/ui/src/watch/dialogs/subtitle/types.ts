export interface SubtitleDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (url: string) => void;
  currentUrl?: string;
}
