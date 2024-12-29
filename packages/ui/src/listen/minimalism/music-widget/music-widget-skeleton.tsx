import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Skeleton from '@mui/material/Skeleton';

const MusicWidgetSkeleton = () => {
  return (
    <Card
      sx={{ width: '345px' }}
      role="progressbar"
      aria-label="Loading music player"
    >
      <Box p={2}>
        <Skeleton
          variant="rectangular"
          width="100%"
          height={194}
          animation="wave"
        />
        <Box mt={2}>
          <Skeleton variant="text" width="20%" animation="wave" />
          <Skeleton
            sx={{ fontSize: '2rem' }}
            variant="text"
            width="50%"
            animation="wave"
          />
          <Skeleton
            sx={{ fontSize: '1.5rem' }}
            variant="text"
            width="30%"
            animation="wave"
          />
          <Skeleton
            variant="rounded"
            width="100%"
            height={16}
            animation="wave"
            sx={{
              my: 1.5,
            }}
          />
          <Skeleton
            variant="rounded"
            width="100%"
            height={72}
            animation="wave"
          />
        </Box>
      </Box>
    </Card>
  );
};

export { MusicWidgetSkeleton };
