import CodeIcon from '@mui/icons-material/Code';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import type { ReactNode } from 'react';

type EditorToolbarIcon =
  | 'bold'
  | 'italic'
  | 'bulletList'
  | 'quote'
  | 'codeBlock';

type EditorToolbarItem =
  | { type: 'divider'; key: string }
  | {
      type: 'button';
      key: string;
      tooltip: string;
      icon?: EditorToolbarIcon;
      label?: string;
      isActive: boolean;
      isDisabled?: boolean;
      onClick: () => void;
    };

const toolbarIcons: Record<EditorToolbarIcon, ReactNode> = {
  bold: <FormatBoldIcon fontSize="small" />,
  italic: <FormatItalicIcon fontSize="small" />,
  bulletList: <FormatListBulletedIcon fontSize="small" />,
  quote: <FormatQuoteIcon fontSize="small" />,
  codeBlock: <CodeIcon fontSize="small" />,
};

interface EditorMenuBarProps {
  items: EditorToolbarItem[];
}

const EditorMenuBar = (props: EditorMenuBarProps) => {
  const { items } = props;

  return (
    <Stack
      direction="row"
      spacing={0.5}
      sx={{
        alignItems: 'center',
      }}
    >
      {items.map((item) =>
        item.type === 'divider' ? (
          <Box
            key={item.key}
            sx={{ width: '1px', height: 24, backgroundColor: 'divider' }}
          />
        ) : (
          <Tooltip key={item.key} title={item.tooltip}>
            <IconButton
              size="small"
              onClick={item.onClick}
              disabled={item.isDisabled}
              color={item.isActive ? 'primary' : 'default'}
            >
              {item.icon ? toolbarIcons[item.icon] : item.label}
            </IconButton>
          </Tooltip>
        ),
      )}
    </Stack>
  );
};

export type { EditorToolbarItem };
export { EditorMenuBar };
