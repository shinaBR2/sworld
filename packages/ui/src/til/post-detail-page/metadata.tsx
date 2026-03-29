import AccessTimeIcon from '@mui/icons-material/AccessTime';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { MuiStyledProps } from '../../universal';

interface Props extends MuiStyledProps {
  title: string;
  readTimeInMinutes: number;
}

const PostMetadata = (props: Props) => {
  const { title, readTimeInMinutes, sx } = props;

  return (
    <Box sx={sx}>
      <Typography
        variant="h3"
        component="h1"
        sx={{
          fontWeight: 700,
          fontSize: { xs: '1.75rem', sm: '2.25rem' },
          lineHeight: 1.3,
          color: 'text.primary',
          mb: 2,
        }}
      >
        {title}
      </Typography>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          color: 'text.secondary',
        }}
      >
        <AccessTimeIcon sx={{ fontSize: '1rem' }} />
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {readTimeInMinutes} min read
        </Typography>
      </Box>
    </Box>
  );
};

export { PostMetadata };
