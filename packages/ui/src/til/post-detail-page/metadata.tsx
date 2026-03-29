import AccessTimeIcon from '@mui/icons-material/AccessTime';
import Typography from '@mui/material/Typography';
import type { MuiStyledProps } from '../../universal';

interface Props extends MuiStyledProps {
  title: string;
  readTimeInMinutes: number;
  createdAt?: string;
}

const PostMetadata = (props: Props) => {
  const { title, readTimeInMinutes, createdAt, sx } = props;

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
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
      >
        <AccessTimeIcon fontSize="small" />
        {readTimeInMinutes} min read
        {createdAt && ` · ${createdAt}`}
      </Typography>
    </>
  );
};

export { PostMetadata };
