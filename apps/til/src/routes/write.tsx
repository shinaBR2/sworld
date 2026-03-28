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
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
          <h1>Create a New TIL</h1>

          {error && (
            <div
              style={{
                padding: '1rem',
                backgroundColor: '#fee',
                border: '1px solid #fcc',
                borderRadius: '4px',
                marginBottom: '1rem',
              }}
            >
              {error}
            </div>
          )}

          <div style={{ marginBottom: '1rem' }}>
            <input
              type="text"
              placeholder="Post title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '0.75rem',
                fontSize: '1.25rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontFamily: 'inherit',
              }}
            />
          </div>

          <div
            style={{
              border: '1px solid #ddd',
              borderRadius: '4px',
              minHeight: '400px',
              marginBottom: '1rem',
            }}
          >
            <EditorContent
              editor={editor}
              style={{
                padding: '1rem',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={
                isSubmitting || !title.trim() || !editor?.getText().trim()
              }
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: isSubmitting ? '#ccc' : '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                fontSize: '1rem',
              }}
            >
              {isSubmitting ? 'Saving...' : 'Save Post'}
            </button>

            <button
              type="button"
              onClick={() => navigate({ to: '/' })}
              disabled={isSubmitting}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                fontSize: '1rem',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </Layout>
    </AuthRoute>
  );
}
