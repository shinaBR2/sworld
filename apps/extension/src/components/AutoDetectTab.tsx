import { Box, CircularProgress, Typography } from '@mui/material';
import type { PageContent } from 'core/universal/extension/communication/types';
import { ActionCard } from './ActionCard';
import { TelegramPanel } from './TelegramPanel';

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
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!content) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography align="center" sx={{ color: 'text.secondary' }}>
          No content detected on this page.
        </Typography>
      </Box>
    );
  }

  // Telegram gets its own multi-video picker (with a login step) rather than the
  // single-item ActionCard the other page types use.
  if (content.pageType === 'telegram') {
    return <TelegramPanel />;
  }

  const isVideo = ['youtube', 'vimeo', 'video-generic'].includes(
    content.pageType,
  );
  const isPdf = content.pageType === 'pdf';
  const targetApp = isVideo ? ('watch' as const) : ('library' as const);
  const typeLabel = isPdf ? 'PDF Document' : isVideo ? 'Video' : 'Web Page';

  return (
    <Box sx={{ p: 2 }}>
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
