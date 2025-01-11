import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import { DialogProps } from '@mui/material/Dialog';

export const StyledDialog = styled(Dialog)<DialogProps>(({ theme }) => ({
  '& .MuiDialog-paper': {
    width: '100%',
    maxWidth: theme.breakpoints.values.sm,
  },
})) as typeof Dialog;

export const StyledCloseButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  right: theme.spacing(1),
  top: theme.spacing(1),
  color: theme.palette.grey[500],
})) as typeof IconButton;

export const StyledResultsStack = styled(Stack)(({ theme }) => {
  const { borderRadius } = theme.shape;

  return {
    maxHeight: '200px',
    overflowY: 'auto',
    '&::-webkit-scrollbar': {
      width: borderRadius / 1.5,
    },
    '&::-webkit-scrollbar-track': {
      background: theme.palette.grey[100],
      borderRadius: borderRadius / 3,
    },
    '&::-webkit-scrollbar-thumb': {
      background: theme.palette.grey[400],
      borderRadius: borderRadius / 3,
    },
  };
}) as typeof Stack;
