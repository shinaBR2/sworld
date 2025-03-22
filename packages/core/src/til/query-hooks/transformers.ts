import { PostQuery } from '../../graphql/graphql';

const transformPost = (data: PostQuery['posts_by_pk']) => {
  if (!data) {
    return null;
  }

  const { brief, id, slug, markdownContent, readTimeInMinutes, title } = data;

  return {
    id,
    title,
    slug,
    brief,
    mContent: markdownContent,
    readTimeInMinutes,
  };
};

export { transformPost };
