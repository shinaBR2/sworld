import { TextFieldVariants } from '@mui/material/TextField';
import { texts } from './texts';

const getFormFieldStaticConfigs = () => {
  return {
    title: {
      fullWidth: true,
      placeholder: texts.form.titleInput.placeholder,
      label: texts.form.titleInput.label,
      helperText: texts.form.titleInput.helperText,
      variant: 'outlined' as TextFieldVariants,
      sx: { mb: 2 },
      'aria-label': texts.form.titleInput.label,
      inputProps: { 'data-testid': 'title-input-text' },
      required: true,
    },
    url: {
      fullWidth: true,
      placeholder: texts.form.urlInput.placeholder,
      label: texts.form.urlInput.label,
      helperText: texts.form.urlInput.helperText,
      variant: 'outlined' as TextFieldVariants,
      sx: { mb: 2 },
      'aria-label': texts.form.urlInput.label,
      inputProps: { 'data-testid': 'url-input-textarea' },
      required: true,
    },
    description: {
      fullWidth: true,
      multiline: true,
      rows: 4,
      placeholder: texts.form.descriptionInput.placeholder,
      label: texts.form.descriptionInput.label,
      helperText: texts.form.descriptionInput.helperText,
      variant: 'outlined' as TextFieldVariants,
      sx: { mb: 2 },
      'aria-label': texts.form.descriptionInput.label,
      inputProps: { 'data-testid': 'description-input-textarea' },
    },
  };
};

export { getFormFieldStaticConfigs };
