import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import type { RequiredLinkComponentWithoutLinkProps } from '../../videos/types';
import { VideoCard } from '../../videos/video-card';
import { COLUMNS_PER_ROW, GRID_COLUMN_PROPS } from '../columns';
import type { ContinueWatchingItem } from './types';
import { genlinkProps } from './utils';

const HISTORY_ROUTE = '/history';

interface ContinueWatchingSectionProps
  extends RequiredLinkComponentWithoutLinkProps {
  videos: ContinueWatchingItem[];
}

const ContinueWatchingSection = (props: ContinueWatchingSectionProps) => {
  const { videos, LinkComponent } = props;
  const theme = useTheme();
  const isXl = useMediaQuery(theme.breakpoints.up('xl'));
  const isLg = useMediaQuery(theme.breakpoints.up('lg'));
  const isMd = useMediaQuery(theme.breakpoints.up('md'));
  const isSm = useMediaQuery(theme.breakpoints.up('sm'));

  if (videos.length === 0) {
    return null;
  }

  const columns = isXl
    ? COLUMNS_PER_ROW.xl
    : isLg
      ? COLUMNS_PER_ROW.lg
      : isMd
        ? COLUMNS_PER_ROW.md
        : isSm
          ? COLUMNS_PER_ROW.sm
          : COLUMNS_PER_ROW.xs;

  const visibleVideos = videos.slice(0, columns);

  return (
    <Box sx={{ mb: 4 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 2,
        }}
      >
        <Typography variant="h6" component="h2">
          Continue watching
        </Typography>
        <LinkComponent to={HISTORY_ROUTE} style={{ textDecoration: 'none' }}>
          <Button size="small">Show all</Button>
        </LinkComponent>
      </Box>
      <Grid container spacing={3}>
        {visibleVideos.map((video) => (
          <Grid size={GRID_COLUMN_PROPS} key={video.id}>
            <VideoCard
              video={video}
              asLink={true}
              LinkComponent={LinkComponent}
              linkProps={genlinkProps(video)}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export { ContinueWatchingSection };
