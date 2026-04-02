import MoreVertIcon from '@mui/icons-material/MoreVert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { createFileRoute, useBlocker } from '@tanstack/react-router';
import { useUpdatePost } from 'core/til/mutation-hooks/updatePost';
import { useLoadPostDetail } from 'core/til/query-hooks/post-detail';
import { slugify } from 'core/universal/common';
import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import {
  PostContent,
  PostDetailPageContainer,
  PostMetadata,
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
        status: 'published',
      },
    });
    handleMenuClose();
    refetch();
  };

  const handleToggleVisibility = async () => {
    const newVisibility = post?.visibility === 'public' ? 'private' : 'public';
    await updatePost({
      id: postId,
      object: {
        visibility: newVisibility,
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
          <Card sx={{ my: 3, border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <SkeletonPostMetadata />
              <SkeletonPostContent />
            </CardContent>
          </Card>
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
        <Stack sx={{ height: 'calc(100vh - 64px)' }}>
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
          <Container
            maxWidth={false}
            sx={{ py: 2, borderBottom: 1, borderColor: 'divider' }}
          >
            <TextField
              fullWidth
              value={editableTitle}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEditableTitle(e.target.value)
              }
              placeholder="Post title..."
              variant="standard"
              InputProps={{
                style: {
                  fontSize: '1.5rem',
                  fontWeight: 600,
                },
              }}
            />
          </Container>

          {/* Editor */}
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
              key={id}
              ref={editorRef}
              content={mContent}
              isSubmitting={isPending || isSaving}
              onUpdate={setEditorContent}
            />
          </Suspense>

          {/* Footer with actions */}
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
                onClick={handleCancel}
                disabled={isPending || isSaving}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleSave}
                disabled={
                  isPending ||
                  isSaving ||
                  !editorContent.trim() ||
                  !editableTitle.trim()
                }
                startIcon={
                  isPending || isSaving ? <CircularProgress size={16} /> : null
                }
              >
                {isPending || isSaving ? 'Saving...' : 'Save'}
              </Button>
            </Stack>
          </Container>
        </Stack>
      </Layout>
    );
  }

  // View mode with toolbar
  return (
    <Layout sx={{ overflow: 'auto', pb: 6 }}>
      <PostDetailPageContainer>
        <Card sx={{ my: 3, border: 1, borderColor: 'divider' }}>
          <CardContent>
            {/* Header with 3-dot menu */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                mb: 1,
              }}
            >
              <Box sx={{ flex: 1 }}>
                <PostMetadata
                  title={title}
                  readTimeInMinutes={readTimeInMinutes}
                  createdAt={createdAt}
                  status={status}
                />
              </Box>
              <IconButton onClick={handleMenuOpen} size="small">
                <MoreVertIcon />
              </IconButton>
              <Menu
                anchorEl={menuAnchorEl}
                open={Boolean(menuAnchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
              >
                <MenuItem onClick={handleEdit}>Edit</MenuItem>
                {status !== 'published' && (
                  <MenuItem onClick={handlePublish}>Publish</MenuItem>
                )}
                <MenuItem onClick={handleToggleVisibility}>
                  Make {post?.visibility === 'public' ? 'Private' : 'Public'}
                </MenuItem>
              </Menu>
            </Box>
            <PostContent>
              <MarkdownContent content={mContent} />
            </PostContent>
          </CardContent>
        </Card>
      </PostDetailPageContainer>
    </Layout>
  );
};

export const Route = createFileRoute('/posts/$slug/$id')({
  component: RouteComponent,
});
