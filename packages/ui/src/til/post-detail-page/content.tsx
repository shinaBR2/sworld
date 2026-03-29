import Box from '@mui/material/Box';
import { CodeBlockWrapper } from './styled';

interface Props {
  children: React.ReactNode;
}

const PostContent = (props: Props) => {
  const { children } = props;

  return (
    <Box
      sx={{
        py: 4,
        '& p': {
          lineHeight: 1.8,
          mb: 2,
        },
        '& h2': {
          fontWeight: 600,
          fontSize: '1.5rem',
          mt: 4,
          mb: 2,
        },
        '& h3': {
          fontWeight: 600,
          fontSize: '1.25rem',
          mt: 3,
          mb: 1.5,
        },
      }}
    >
      <CodeBlockWrapper>{children}</CodeBlockWrapper>
    </Box>
  );
};

export { PostContent };
