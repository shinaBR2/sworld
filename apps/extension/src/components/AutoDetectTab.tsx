import { Box, CircularProgress, Typography } from '@mui/material';
import type { PageContent } from 'core/universal/extension/communication/types';
import { ActionCard } from './ActionCard';

interface AutoDetectTabProps {
  content: PageContent | null;
  isLoading: boolean;
  onImport: (contentId: string, targetApp: 'library' | 'watch') => void;
}

const AutoDetectTab = ({
  content,
  isLoading,
  onImport,
}: AutoDetectTabProps) => {
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (!content) {
    return (
      <Box p={2}>
        <Typography color="text.secondary" align="center">
          No content detected on this page.
        </Typography>
      </Box>
    );
  }

  const isVideo = ['youtube', 'vimeo', 'video-generic'].includes(
    content.pageType,
  );
  const isPdf = content.pageType === 'pdf';
  const targetApp = isVideo ? ('watch' as const) : ('library' as const);
  const typeLabel = isPdf ? 'PDF Document' : isVideo ? 'Video' : 'Web Page';

  return (
    <Box p={2}>
      <ActionCard
        title={content.title}
        description={content.description}
        url={content.url}
        typeLabel={typeLabel}
        onImport={() => onImport(content.url, targetApp)}
        importButtonLabel={isVideo ? 'Import to Watch' : 'Import to Library'}
      />
    </Box>
  );
};

export { AutoDetectTab };
