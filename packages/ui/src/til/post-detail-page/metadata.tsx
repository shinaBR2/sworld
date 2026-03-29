import AccessTimeIcon from '@mui/icons-material/AccessTime';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { MuiStyledProps } from '../../universal';

interface Props extends MuiStyledProps {
  title: string;
  readTimeInMinutes: number;
}

const PostMetadata = (props: Props) => {
  const { title, readTimeInMinutes, sx } = props;

  return (
    <Stack sx={sx} spacing={2}>
      <Typography variant="h4" component="h1">
        {title}
      </Typography>
      <Stack direction="row" alignItems="center" spacing={1}>
        <AccessTimeIcon fontSize="small" color="action" />
        <Typography variant="body2" color="text.secondary">
          {readTimeInMinutes} min read
        </Typography>
      </Stack>
    </Stack>
  );
};

export { PostMetadata };
