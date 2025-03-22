const transformPost = (data: any) => {
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
