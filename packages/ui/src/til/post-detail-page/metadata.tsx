import AccessTimeIcon from '@mui/icons-material/AccessTime';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import type { MuiStyledProps } from '../../universal';
import { formatDate } from '../posts/utils/date';

interface Props extends MuiStyledProps {
  title: string;
  readTimeInMinutes: number;
  createdAt?: string;
  status?: string;
}

const PostMetadata = (props: Props) => {
  const { title, readTimeInMinutes, createdAt, status, sx } = props;

  return (
    <>
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        fontWeight="bold"
        sx={sx}
      >
        {title}
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Chip
          label={status || 'Published'}
          color={status === 'published' ? 'success' : 'default'}
          size="small"
          variant="outlined"
        />
        {createdAt && (
          <Typography variant="body2" color="text.secondary">
            {formatDate(createdAt)}
          </Typography>
        )}
      </Box>

      <Divider sx={{ my: 2 }} />

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
      >
        <AccessTimeIcon fontSize="small" />
        {readTimeInMinutes} min read
      </Typography>
    </>
  );
};

export { PostMetadata };
