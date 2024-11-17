export interface DialogueChoice {
  text: string;
  nextDialogue?: DialogueContent;
  callback?: () => void;
}

export interface DialogueContent {
  speaker: string;
  text: string;
  choices?: DialogueChoice[];
}

export interface GameDialogProps {
  isOpen: boolean;
  onClose: () => void;
  dialogue: DialogueContent;
  typewriterSpeed?: number;
  charsPerPage?: number;
}
