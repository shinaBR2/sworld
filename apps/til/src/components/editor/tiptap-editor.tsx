import './tiptap-styles.css';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import CodeBlock from '@tiptap/extension-code-block';
import Placeholder from '@tiptap/extension-placeholder';
import { Markdown } from '@tiptap/markdown';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { forwardRef, useImperativeHandle } from 'react';
import { MenuBar } from './menuBar';

export interface TipTapEditorRef {
  getMarkdown: () => string;
  getText: () => string;
}

interface TipTapEditorProps {
  isSubmitting: boolean;
  onUpdate: (content: string) => void;
}

const TipTapEditor = forwardRef<TipTapEditorRef, TipTapEditorProps>(
  ({ isSubmitting, onUpdate }, ref) => {
    const editor = useEditor({
      extensions: [
        StarterKit.configure({
          codeBlock: false,
        }),
        CodeBlock.configure({
          defaultLanguage: 'javascript',
        }),
        Markdown,
        Placeholder.configure({
          placeholder: 'Start writing your TIL post...',
        }),
      ],
      content: '',
      contentType: 'markdown',
      editable: !isSubmitting,
      onUpdate: ({ editor }) => {
        onUpdate(editor.getText());
      },
    });

    useImperativeHandle(
      ref,
      () => ({
        getMarkdown: () => editor?.getMarkdown() || '',
        getText: () => editor?.getText() || '',
      }),
      [editor],
    );

    if (!editor) {
      return (
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CircularProgress />
        </Box>
      );
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
          <MenuBar editor={editor} />
        </Container>

        {/* Editor */}
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          <Container maxWidth={false} sx={{ py: 4 }}>
            <EditorContent editor={editor} />
          </Container>
        </Box>
      </>
    );
  },
);

TipTapEditor.displayName = 'TipTapEditor';

export { TipTapEditor };
export default TipTapEditor;
