import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { Card, CardContent } from '@mui/material';
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
    <Card sx={sx}>
      <CardContent>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
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
      </CardContent>
    </Card>
  );
};

export { PostMetadata };
