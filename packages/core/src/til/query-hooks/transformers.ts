import type { PostQuery } from '../../graphql/graphql';

const transformPost = (data: NonNullable<PostQuery['posts_by_pk']>) => {
  const {
    brief,
    id,
    slug,
    markdownContent,
    readTimeInMinutes,
    title,
    created_at,
  } = data;

  return {
    id,
    title,
    slug,
    brief,
    mContent: markdownContent,
    readTimeInMinutes,
    createdAt: created_at,
  };
};

export { transformPost };
