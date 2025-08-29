import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import { Link } from '@tanstack/react-router';
import type { useLoadPosts } from 'core/til/query-hooks/posts';
import type { RequiredLinkComponent } from '../../watch/videos/types';
import { PostCard } from '../posts/post-card';
import { SkeletonPostCard } from '../posts/post-card/skeleton';
import { texts } from './texts';

const Loading = () => {
  return (
    <Grid container spacing={2}>
      {Array(12)
        .fill(0)
        .map((_, i) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
            <SkeletonPostCard />
          </Grid>
        ))}
    </Grid>
  );
};

interface HomeContainerProps extends Omit<RequiredLinkComponent, 'linkProps'> {
  queryRs: ReturnType<typeof useLoadPosts>;
}

const HomeContainer = (props: HomeContainerProps) => {
  const { queryRs } = props;
  const { posts, isLoading } = queryRs;

  return (
    <Container
      maxWidth={false}
      sx={{ flex: 1, height: 0, py: 3, px: { xs: 2, sm: 3 }, overflow: 'auto' }}
    >
      {isLoading ? (
        <Loading />
      ) : posts.length > 0 ? (
        <Grid container spacing={2}>
          {posts.map((p) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={p.id}>
              <PostCard post={p} LinkComponent={Link} />
            </Grid>
          ))}
        </Grid>
      ) : (
        texts.noPosts
      )}
    </Container>
  );
};

export { HomeContainer };
