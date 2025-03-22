import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import baseTheme from '../../baseTheme';

const CodeBlockWrapper = styled(Box)({
  borderRadius: '8px',
  overflow: 'auto',
  margin: '24px 0',
  '& pre pre': {
    margin: 0,
    padding: baseTheme.spacing(4),
    borderRadius: baseTheme.spacing(1),
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
