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
  right: 8,
  top: 8,
  color: theme.palette.grey[500],
})) as typeof IconButton;

export const StyledResultsStack = styled(Stack)(({ theme }) => ({
  maxHeight: '200px',
  overflowY: 'auto',
  '&::-webkit-scrollbar': {
    width: '8px',
  },
  '&::-webkit-scrollbar-track': {
    background: theme.palette.grey[100],
    borderRadius: '4px',
  },
  '&::-webkit-scrollbar-thumb': {
    background: theme.palette.grey[400],
    borderRadius: '4px',
  },
})) as typeof Stack;
