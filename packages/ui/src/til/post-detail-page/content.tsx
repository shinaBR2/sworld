import { CodeBlockWrapper } from './styled';

interface Props {
  children: React.ReactNode;
}

const PostContent = (props: Props) => {
  return <CodeBlockWrapper>{props.children}</CodeBlockWrapper>;
};

export { PostContent };
