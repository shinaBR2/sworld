import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import baseTheme from '../../baseTheme';

const CodeBlockWrapper = styled(Box)({
  borderRadius: baseTheme.spacing(1),
  maxWidth: '100%',
  overflow: 'hidden',
  '& pre pre': {
    margin: 0,
    padding: baseTheme.spacing(4),
    borderRadius: baseTheme.spacing(1),
    overflowX: 'auto',
  },
  '& p code': {
    fontFamily: '"SF Mono", Menlo, Monaco, Consolas, monospace',
    fontSize: '0.875rem',
    lineHeight: 1.5,
    backgroundColor: baseTheme.palette.primary.main,
    padding: '2px 6px',
    borderRadius: '3px',
  },
}) as typeof Box;

export { CodeBlockWrapper };
