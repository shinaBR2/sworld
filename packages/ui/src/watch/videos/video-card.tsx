import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';

interface Creator {
  username: string;
}
export interface Video {
  id: string;
  title: string;
  thumbnail?: string;
  // views: number;
  createdAt: string;
  duration?: string;
  user: Creator;
}

const defaultThumbnailUrl = `data:image/svg+xml,${encodeURIComponent(`
  <svg viewBox="0 0 1920 1080" xmlns="http://www.w3.org/2000/svg">
    <rect width="1920" height="1080" fill="#f0f0f0"/>
    <circle cx="960" cy="540" r="100" fill="#e0e0e0"/>
    <path d="M920 480 L1020 540 L920 600 Z" fill="#9e9e9e"/>
    <path d="M0 200 Q 480 400 960 200 T 1920 200" stroke="#e8e8e8" fill="none" stroke-width="40"/>
    <path d="M0 800 Q 480 600 960 800 T 1920 800" stroke="#e8e8e8" fill="none" stroke-width="40"/>
  </svg>
  `)}`;

const VideoCard = ({ video }: { video: Video }) => {
  const { title, thumbnail, duration, createdAt, user } = video;
  const createdTime = new Date(createdAt).toISOString().split('T')[0];
  const { username: creator } = user;

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 'none',
        bgcolor: 'transparent',
        transition: 'all 0.2s',
        '&:hover': {
          transform: 'scale(1.02)',
          cursor: 'pointer',
        },
      }}
    >
      <Box sx={{ position: 'relative', borderRadius: 2, overflow: 'hidden' }}>
        <CardMedia
          component="img"
          image={thumbnail ?? defaultThumbnailUrl}
          alt={title}
          sx={{
            aspectRatio: '16/9',
            objectFit: 'cover',
            bgcolor: '#e0e0e0',
          }}
        />
        {duration && (
          <Typography
            variant="caption"
            sx={{
              position: 'absolute',
              bottom: 8,
              right: 8,
              bgcolor: 'rgba(0, 0, 0, 0.8)',
              color: 'white',
              px: 1,
              py: 0.5,
              borderRadius: 1,
              fontWeight: 500,
            }}
          >
            {duration}
          </Typography>
        )}
      </Box>
      <CardContent sx={{ p: 1.5, pt: 2, '&:last-child': { pb: 1 } }}>
        <Typography
          gutterBottom
          variant="body1"
          component="h3"
          sx={{
            fontWeight: 500,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            mb: 0.5,
            lineHeight: 1.3,
          }}
        >
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
          {creator} • {createdTime}
        </Typography>
      </CardContent>
    </Card>
  );
};

export { VideoCard };
