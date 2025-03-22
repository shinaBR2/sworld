interface GeneratePostDetailRouteProps {
  id: string;
  slug: string;
}

const generatePostDetailRoute = (props: GeneratePostDetailRouteProps) => {
  const { id, slug } = props;

  return {
    to: '/posts/$slug/$id',
    params: {
      slug,
      id,
    },
  };
};

export { generatePostDetailRoute };
