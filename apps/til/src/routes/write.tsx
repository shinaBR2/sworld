import {
  createFileRoute,
  useBlocker,
  useNavigate,
} from '@tanstack/react-router';
import { useInsertPost } from 'core/til/mutation-hooks/insertPost';
import { slugify } from 'core/universal/common';
import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { EditorLoading, WriteForm } from 'ui/til/editor';
import { AuthRoute } from 'ui/universal/authRoute';
import { Notification } from 'ui/universal/notification';
import { UnsavedChangesDialog } from 'ui/universal/unsavedChangesDialog';
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

  const [notification, setNotification] = useState<{
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  } | null>(null);

  // Track if there are unsaved changes
  const hasUnsavedChanges = title.trim() !== '' || editorContent.trim() !== '';

  // Block browser navigation when there are unsaved changes
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Block in-app navigation when there are unsaved changes
  const blocker = useBlocker({
    shouldBlockFn: () => hasUnsavedChanges,
    withResolver: true,
  });

  const insertPost = useInsertPost({
    onSuccess: (data) => {
      const slug = data.insert_posts_one?.slug;
      const id = data.insert_posts_one?.id;
      if (slug && id) {
        setNotification({
          message: 'Post published successfully!',
          severity: 'success',
        });
        setTitle('');
        setEditorContent('');
        setTimeout(() => {
          navigate({ to: '/posts/$slug/$id', params: { slug, id } });
        }, 100);
      }
    },
    onError: (error) => {
      setError('Failed to save post. Please try again.');
      setNotification({
        message: 'Failed to save post. Please try again.',
        severity: 'error',
      });
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
      {/* Blocker Dialog */}
      <UnsavedChangesDialog
        open={blocker.status === 'blocked'}
        onStay={() => blocker.reset?.()}
        onLeave={() => blocker.proceed?.()}
      />

      {/* Notification */}
      {notification && (
        <Notification
          notification={notification}
          onClose={() => setNotification(null)}
        />
      )}

      <WriteForm
        title={title}
        onTitleChange={setTitle}
        error={error}
        isSubmitting={isSubmitting}
        canSubmit={Boolean(title.trim() && editorContent.trim())}
        onCancel={() => navigate({ to: '/' })}
        onSubmit={handleSubmit}
      >
        {/* Editor with lazy loading */}
        <Suspense fallback={<EditorLoading />}>
          <TipTapEditor
            ref={editorRef}
            isSubmitting={isSubmitting}
            onUpdate={setEditorContent}
          />
        </Suspense>
      </WriteForm>
    </Layout>
  );
}
