import { createFileRoute, useBlocker } from '@tanstack/react-router';
import { POST_STATUS, POST_VISIBILITY } from 'core/til/constants';
import { useUpdatePost } from 'core/til/mutation-hooks/updatePost';
import { useLoadPostDetail } from 'core/til/query-hooks/post-detail';
import { slugify } from 'core/universal/common';
import { lazy, Suspense, useEffect, useRef, useState } from 'react';

import {
  PostContent,
  PostDetailCard,
  PostDetailPageContainer,
  PostEditContainer,
  PostEditFooter,
  PostEditorLoading,
  type PostMenuAction,
  PostTitleField,
  PostViewHeader,
  SkeletonPostContent,
  SkeletonPostMetadata,
} from 'ui/til/post-detail-page';
import { Notification as UINotification } from 'ui/universal/notification';
import { UnsavedChangesDialog } from 'ui/universal/unsavedChangesDialog';
import type { TipTapEditorRef } from '../components/editor/tiptap-editor';
import { Layout } from '../components/layout';
import { MarkdownContent } from '../components/markdown';

const TipTapEditor = lazy(() => import('../components/editor/tiptap-editor'));

const RouteComponent = () => {
  const { id: postId } = Route.useParams();
  const queryRs = useLoadPostDetail(postId);
  const { post, isLoading, refetch } = queryRs;
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editorContent, setEditorContent] = useState('');
  const [editableTitle, setEditableTitle] = useState('');
  const editorRef = useRef<TipTapEditorRef>(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [notification, setNotification] = useState<{
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  } | null>(null);

  const { updatePost, isPending } = useUpdatePost({
    onSuccess: () => {
      setNotification({
        message: 'Post updated successfully!',
        severity: 'success',
      });
      setIsEditing(false);
      setEditableTitle('');
      setEditorContent('');
      setTimeout(() => {
        refetch();
      }, 100);
    },
    onError: () => {
      setNotification({
        message: 'Failed to update post. Please try again.',
        severity: 'error',
      });
    },
  });

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleEdit = () => {
    setEditableTitle(title);
    setIsEditing(true);
    handleMenuClose();
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditableTitle('');
    setEditorContent('');
  };

  const handleSave = async () => {
    if (!editorRef.current) return;
    setIsSaving(true);
    const markdown = editorRef.current.getMarkdown() || '';
    await updatePost({
      id: postId,
      object: {
        title: editableTitle.trim(),
        slug: slugify(editableTitle),
        markdownContent: markdown,
      },
    });
    setIsSaving(false);
  };

  const handlePublish = async () => {
    await updatePost({
      id: postId,
      object: {
        status: POST_STATUS.PUBLISHED,
      },
    });
    handleMenuClose();
    refetch();
  };

  const handleToggleVisibility = async () => {
    const newVisibility =
      post?.visibility === POST_VISIBILITY.PUBLIC
        ? POST_VISIBILITY.PRIVATE
        : POST_VISIBILITY.PUBLIC;
    await updatePost({
      id: postId,
      object: {
        visibility: newVisibility,
      },
    });
    handleMenuClose();
    refetch();
  };

  const handleTogglePin = async () => {
    await updatePost({
      id: postId,
      object: {
        pinned: !post?.pinned,
      },
    });
    handleMenuClose();
    refetch();
  };

  // Store original values for comparison
  const originalTitle = post?.title ?? '';
  const originalContent = post?.mContent ?? '';

  // Track if there are unsaved changes (only when editing)
  const hasUnsavedChanges =
    isEditing &&
    (editableTitle !== originalTitle || editorContent !== originalContent);

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
    shouldBlockFn: () => hasUnsavedChanges && isEditing,
    withResolver: true,
  });

  if (isLoading) {
    return (
      <Layout sx={{ overflow: 'auto', pb: 6 }}>
        <PostDetailPageContainer>
          <PostDetailCard>
            <SkeletonPostMetadata />
            <SkeletonPostContent />
          </PostDetailCard>
        </PostDetailPageContainer>
      </Layout>
    );
  }

  if (!post) {
    return (
      <Layout sx={{ overflow: 'auto', pb: 6 }}>
        <PostDetailPageContainer>
          <h2>Post Not Found</h2>
          <p>The post you're looking for is unavailable or has been removed.</p>
        </PostDetailPageContainer>
      </Layout>
    );
  }

  const { id, title, readTimeInMinutes, mContent, createdAt, status } = post;

  // Edit mode - full page layout like /write
  if (isEditing) {
    return (
      <Layout>
        <PostEditContainer>
          {/* Blocker Dialog */}
          <UnsavedChangesDialog
            open={blocker.status === 'blocked'}
            onStay={() => blocker.reset?.()}
            onLeave={() => blocker.proceed?.()}
          />

          {/* Notification */}
          {notification && (
            <UINotification
              notification={notification}
              onClose={() => setNotification(null)}
            />
          )}

          {/* Header with title */}
          <PostTitleField
            value={editableTitle}
            onChange={setEditableTitle}
            placeholder="Post title..."
          />

          {/* Editor */}
          <Suspense fallback={<PostEditorLoading />}>
            <TipTapEditor
              key={id}
              ref={editorRef}
              content={mContent}
              isSubmitting={isPending || isSaving}
              onUpdate={setEditorContent}
            />
          </Suspense>

          {/* Footer with actions */}
          <PostEditFooter
            onCancel={handleCancel}
            onSave={handleSave}
            isSaving={isPending || isSaving}
            canSave={Boolean(editorContent.trim() && editableTitle.trim())}
          />
        </PostEditContainer>
      </Layout>
    );
  }

  const menuActions: PostMenuAction[] = [
    { label: 'Edit', onClick: handleEdit },
    ...(status !== POST_STATUS.PUBLISHED
      ? [{ label: 'Publish', onClick: handlePublish }]
      : []),
    {
      label: `Make ${
        post?.visibility === POST_VISIBILITY.PUBLIC ? 'Private' : 'Public'
      }`,
      onClick: handleToggleVisibility,
    },
    { label: post?.pinned ? 'Unpin' : 'Pin', onClick: handleTogglePin },
  ];

  // View mode with toolbar
  return (
    <Layout sx={{ overflow: 'auto', pb: 6 }}>
      <PostDetailPageContainer>
        <PostDetailCard>
          <PostViewHeader
            title={title}
            readTimeInMinutes={readTimeInMinutes}
            createdAt={createdAt}
            status={status}
            menuAnchorEl={menuAnchorEl}
            onMenuOpen={handleMenuOpen}
            onMenuClose={handleMenuClose}
            actions={menuActions}
          />
          <PostContent>
            <MarkdownContent content={mContent} />
          </PostContent>
        </PostDetailCard>
      </PostDetailPageContainer>
    </Layout>
  );
};

export const Route = createFileRoute('/posts/$slug/$id')({
  component: RouteComponent,
});
