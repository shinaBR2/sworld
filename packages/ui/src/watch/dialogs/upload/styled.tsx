import Dialog, { type DialogProps } from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';

export const StyledDialog = styled(Dialog)<DialogProps>(({ theme }) => ({
  '& .MuiDialog-paper': {
    width: '100%',
    maxWidth: theme.breakpoints.values.sm,
    overflowX: 'hidden',
  },
})) as typeof Dialog;

export const StyledCloseButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  right: theme.spacing(1),
  top: theme.spacing(1),
  color: theme.palette.text.secondary,
})) as typeof IconButton;

export const StyledResultsStack = styled(Stack)(({ theme }) => {
  const borderRadius = Number(theme.shape.borderRadius);

  return {
    maxHeight: '200px',
    overflowY: 'auto',
    '&::-webkit-scrollbar': {
      width: borderRadius / 1.5,
    },
    '&::-webkit-scrollbar-track': {
      background: theme.palette.action.hover,
      borderRadius: borderRadius / 3,
    },
    '&::-webkit-scrollbar-thumb': {
      background: theme.palette.action.disabled,
      borderRadius: borderRadius / 3,
    },
  };
}) as typeof Stack;
