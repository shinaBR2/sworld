import { TextFieldVariants } from '@mui/material/TextField';
import { texts } from './texts';

const getFormFieldStaticConfigs = () => {
  return {
    url: {
      fullWidth: true,
      placeholder: texts.form.urlInput.placeholder,
      label: texts.form.urlInput.label,
      helperText: texts.form.urlInput.helperText,
      variant: 'outlined' as TextFieldVariants,
      sx: { mb: 2 },
      'aria-label': texts.form.urlInput.label,
      inputProps: { 'data-testid': 'url-input-text' },
      required: true,
    },
  };
};

export { getFormFieldStaticConfigs };
