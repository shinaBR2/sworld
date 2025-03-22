const transformPost = (data: any) => {
  const { brief, id, markdownContent, readTimeInMinutes, title } = data;

  return {
    id,
    title,
    brief,
    mContent: markdownContent,
    readTimeInMinutes,
  };
};

export { transformPost };
