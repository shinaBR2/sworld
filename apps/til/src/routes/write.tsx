import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import Placeholder from '@tiptap/extension-placeholder';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useInsertPost } from 'core/til/mutation-hooks/insertPost';
import { slugify } from 'core/universal/common';
import { useState } from 'react';
import { AuthRoute } from 'ui/universal/authRoute';
import { Layout } from '../components/layout';

export const Route = createFileRoute('/write')({
  component: WritePage,
});

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
    <AuthRoute>
      <Layout>
        <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Create a New TIL
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              label="Post title"
              placeholder="Enter your post title..."
              value={title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setTitle(e.target.value)
              }
              disabled={isSubmitting}
              variant="outlined"
            />
          </Box>

          <Paper
            sx={{
              border: 1,
              borderColor: 'divider',
              minHeight: 400,
              mb: 2,
              p: 2,
            }}
          >
            <EditorContent editor={editor} />
          </Paper>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={
                isSubmitting || !title.trim() || !editor?.getText().trim()
              }
              startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
            >
              {isSubmitting ? 'Saving...' : 'Save Post'}
            </Button>

            <Button
              variant="outlined"
              onClick={() => navigate({ to: '/' })}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Layout>
    </AuthRoute>
  );
}
