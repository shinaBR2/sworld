import CardMedia from '@mui/material/CardMedia';
import { defaultThumbnailUrl } from '../../../universal/images/default-thumbnail';

interface VideoThumnailProps {
  title: string;
}

const VideoThumnail = (props: VideoThumnailProps) => {
  const { title } = props;

  return (
    <CardMedia
      component="img"
      image={defaultThumbnailUrl}
      alt={title}
      sx={{
        aspectRatio: '16/9',
        objectFit: 'cover',
        bgcolor: '#e0e0e0',
      }}
    />
  );
};

export { VideoThumnail };
