import { useState } from 'react';
import { DialogComponent } from './dialog';
import { DialogState } from './types';
import { BaseDialogProps } from '../types';

const defaultState: DialogState = {
  url: '',
  isSubmitting: false,
  error: null,
  closeDialogCountdown: null,
};

const DeveloperImportDialog = (props: BaseDialogProps) => {
  const { open, onOpenChange } = props;
  const [state, setState] = useState<DialogState>({
    ...defaultState,
  });

  const handleClose = () => {
    onOpenChange(false);
  };

  const onFormFieldChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.trim();
    setState(prev => ({
      ...prev,
      [field]: newValue,
      error: null,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState(prev => ({ ...prev, isSubmitting: true, error: null }));

    // TODO
  };

  return (
    <DialogComponent
      open={open}
      state={state}
      handleClose={handleClose}
      onFormFieldChange={onFormFieldChange}
      handleSubmit={handleSubmit}
    />
  );
};

export { DeveloperImportDialog };
