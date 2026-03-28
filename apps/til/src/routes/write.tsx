import './tiptap-styles.css';

import CodeIcon from '@mui/icons-material/Code';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import Placeholder from '@tiptap/extension-placeholder';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useInsertPost } from 'core/til/mutation-hooks/insertPost';
import { slugify } from 'core/universal/common';
import { useState } from 'react';
import { Layout } from '../components/layout';

export const Route = createFileRoute('/write')({
  component: WritePage,
});

const MenuBar = ({ editor }: { editor: ReturnType<typeof useEditor> }) => {
  if (!editor) return null;

  return (
    <Stack direction="row" spacing={0.5} alignItems="center">
      <Tooltip title="Bold">
        <IconButton
          size="small"
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          color={editor.isActive('bold') ? 'primary' : 'default'}
        >
          <FormatBoldIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Italic">
        <IconButton
          size="small"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          color={editor.isActive('italic') ? 'primary' : 'default'}
        >
          <FormatItalicIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Box sx={{ width: '1px', height: 24, backgroundColor: 'divider' }} />
      <Tooltip title="Heading 1">
        <IconButton
          size="small"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          color={
            editor.isActive('heading', { level: 1 }) ? 'primary' : 'default'
          }
        >
          H1
        </IconButton>
      </Tooltip>
      <Tooltip title="Heading 2">
        <IconButton
          size="small"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          color={
            editor.isActive('heading', { level: 2 }) ? 'primary' : 'default'
          }
        >
          H2
        </IconButton>
      </Tooltip>
      <Tooltip title="Heading 3">
        <IconButton
          size="small"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          color={
            editor.isActive('heading', { level: 3 }) ? 'primary' : 'default'
          }
        >
          H3
        </IconButton>
      </Tooltip>
      <Tooltip title="Bullet List">
        <IconButton
          size="small"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          color={editor.isActive('bulletList') ? 'primary' : 'default'}
        >
          <FormatListBulletedIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Quote">
        <IconButton
          size="small"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          color={editor.isActive('blockquote') ? 'primary' : 'default'}
        >
          <FormatQuoteIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Code Block">
        <IconButton
          size="small"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          color={editor.isActive('codeBlock') ? 'primary' : 'default'}
        >
          <CodeIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Stack>
  );
};

function WritePage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const insertPost = useInsertPost({
    onSuccess: (data) => {
      const slug = data.insert_posts_one?.slug;
      const id = data.insert_posts_one?.id;
      if (slug && id) {
        navigate({ to: '/posts/$slug/$id', params: { slug, id } });
      }
    },
    onError: (error) => {
      setError('Failed to save post. Please try again.');
      console.error('Save error:', error);
    },
  });

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Start writing your TIL post...',
      }),
    ],
    content: '',
    editable: !isSubmitting,
  });

  const handleSubmit = async () => {
    if (!title.trim() || !editor?.getText().trim()) {
      setError('Title and content are required');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const content = editor?.getHTML() || '';
      const slug = slugify(title);

      await insertPost({
        object: {
          title: title.trim(),
          slug,
          markdownContent: content,
          brief:
            content.substring(0, 200) + (content.length > 200 ? '...' : ''),
          readTimeInMinutes: Math.max(
            1,
            Math.ceil(editor?.getText().split(' ').length / 200),
          ),
        },
      });
    } catch (error) {
      setError('Failed to save post. Please try again.');
      console.error('Save error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <Stack sx={{ height: 'calc(100vh - 64px)' }}>
        {/* Header */}
        <Container
          maxWidth={false}
          sx={{ py: 2, borderBottom: 1, borderColor: 'divider' }}
        >
          <TextField
            fullWidth
            placeholder="Post title..."
            value={title}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setTitle(e.target.value)
            }
            disabled={isSubmitting}
            variant="standard"
            InputProps={{
              style: {
                fontSize: '1.5rem',
                fontWeight: 600,
              },
            }}
          />
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </Container>

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

        {/* Footer */}
        <Container
          maxWidth={false}
          sx={{
            py: 2,
            borderTop: 1,
            borderColor: 'divider',
          }}
        >
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            justifyContent="flex-end"
          >
            <Button
              variant="outlined"
              onClick={() => navigate({ to: '/' })}
              disabled={isSubmitting}
              fullWidth
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={
                isSubmitting || !title.trim() || !editor?.getText().trim()
              }
              startIcon={isSubmitting ? <CircularProgress size={16} /> : null}
              fullWidth
            >
              {isSubmitting ? 'Publishing...' : 'Publish'}
            </Button>
          </Stack>
        </Container>
      </Stack>
    </Layout>
  );
}
