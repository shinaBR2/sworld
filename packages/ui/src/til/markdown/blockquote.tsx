import Box from '@mui/material/Box';

interface MarkdownBlockquoteProps {
  children: React.ReactNode;
}

const MarkdownBlockquote = (props: MarkdownBlockquoteProps) => {
  return (
    <Box
      component="blockquote"
      sx={{
        borderLeft: 4,
        borderColor: 'primary.main',
        pl: 2,
        py: 1,
        my: 2,
        mx: 0,
        bgcolor: 'action.hover',
        '& p': { m: 0 },
      }}
    >
      {props.children}
    </Box>
  );
};

export { MarkdownBlockquote };
