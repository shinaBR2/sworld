import Skeleton from '@mui/material/Skeleton';
import {
  SkeletonContainer,
  SkeletonContent,
  SkeletonThumbnail,
  THUMBNAIL_HEIGHT,
  THUMBNAIL_WIDTH,
} from './styled';

const VideoListItemSkeleton = () => {
  return (
    <SkeletonContainer
      component="article"
      role="article"
      aria-busy="true"
      aria-label="Loading video item"
    >
      {/* Thumbnail skeleton */}
      <SkeletonThumbnail
        aria-label="Loading thumbnail"
        sx={{ position: 'relative', flexShrink: 0 }}
      >
        <Skeleton
          variant="rectangular"
          width={THUMBNAIL_WIDTH}
          height={THUMBNAIL_HEIGHT}
          sx={{ borderRadius: 1 }}
          animation="wave"
        />
      </SkeletonThumbnail>

      {/* Text content skeletons */}
      <SkeletonContent role="presentation" sx={{ minWidth: 0, flex: 1 }}>
        <Skeleton
          variant="text"
          width="85%"
          height={20}
          sx={{ marginBottom: 0.5 }}
          animation="wave"
          aria-label="Loading title"
        />
        <Skeleton
          variant="text"
          width="40%"
          height={16}
          animation="wave"
          aria-label="Loading metadata"
        />
      </SkeletonContent>
    </SkeletonContainer>
  );
};

export { VideoListItemSkeleton };
