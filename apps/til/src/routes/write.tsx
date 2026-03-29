import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useInsertPost } from 'core/til/mutation-hooks/insertPost';
import { slugify } from 'core/universal/common';
import { lazy, Suspense, useRef, useState } from 'react';
import { AuthRoute } from 'ui/universal/authRoute';
import type { TipTapEditorRef } from '../components/editor/tiptap-editor';
import { Layout } from '../components/layout';

const TipTapEditor = lazy(() => import('../components/editor/tiptap-editor'));

export const Route = createFileRoute('/write')({
  component: WritePage,
});

function WritePage() {
  return (
    <AuthRoute>
      <WritePageContent />
    </AuthRoute>
  );
}

function WritePageContent() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [editorContent, setEditorContent] = useState('');
  const editorRef = useRef<TipTapEditorRef>(null);

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

  const handleSubmit = async () => {
    if (!title.trim() || !editorContent.trim() || !editorRef.current) {
      setError('Title and content are required');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const content = editorRef.current.getMarkdown() || '';
      const text = editorRef.current.getText().trim() || '';
      const slug = slugify(title);

      await insertPost({
        object: {
          title: title.trim(),
          slug,
          markdownContent: content,
          brief: text.substring(0, 200) + (text.length > 200 ? '...' : ''),
          readTimeInMinutes: Math.max(
            1,
            Math.ceil(text.split(/\s+/).filter(Boolean).length / 200),
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

        {/* Editor with lazy loading */}
        <Suspense
          fallback={
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
          }
        >
          <TipTapEditor
            ref={editorRef}
            isSubmitting={isSubmitting}
            onUpdate={setEditorContent}
          />
        </Suspense>

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
              disabled={isSubmitting || !title.trim() || !editorContent.trim()}
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
