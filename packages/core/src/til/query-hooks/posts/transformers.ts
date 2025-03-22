const transformPost = (data: any) => {
  const { brief, id, markdown_content, readTimeInMinutes, title } = data;

  return {
    id,
    title,
    brief,
    mContent: markdown_content,
    readTimeInMinutes,
  };
};

export { transformPost };
