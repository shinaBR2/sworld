import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import type { ReactNode } from 'react';
import { EditorLoading } from './loading';
import { EditorMenuBar, type EditorToolbarItem } from './menu-bar';

interface EditorShellProps {
  isLoading: boolean;
  menuItems: EditorToolbarItem[];
  children: ReactNode;
}

const EditorShell = (props: EditorShellProps) => {
  const { isLoading, menuItems, children } = props;

  if (isLoading) {
    return <EditorLoading />;
  }

  return (
    <>
      {/* MenuBar */}
      <Container
        maxWidth={false}
        sx={{
          py: 1,
          borderBottom: 1,
          borderColor: 'divider',
          backgroundColor: 'background.paper',
        }}
      >
        <EditorMenuBar items={menuItems} />
      </Container>

      {/* Editor */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <Container maxWidth={false} sx={{ py: 4 }}>
          {children}
        </Container>
      </Box>
    </>
  );
};

export { EditorShell };
