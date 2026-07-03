import Stack from '@mui/material/Stack';

interface PostEditContainerProps {
  children: React.ReactNode;
}

const PostEditContainer = (props: PostEditContainerProps) => {
  return <Stack sx={{ height: 'calc(100vh - 64px)' }}>{props.children}</Stack>;
};

export { PostEditContainer };
