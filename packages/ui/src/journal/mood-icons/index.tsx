// packages/ui/src/journal/mood-icon.tsx

import SentimentNeutralIcon from '@mui/icons-material/SentimentNeutral';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import type { SvgIconProps } from '@mui/material';
import type { MoodType } from 'core/src/journal/types';
import type React from 'react';

interface MoodIconProps {
  mood: MoodType;
  size?: number;
  className?: string;
}

const MoodIcon: React.FC<MoodIconProps> = ({ mood, size = 24, className }) => {
  const iconProps: SvgIconProps = {
    style: { width: size, height: size },
    className,
  };

  switch (mood) {
    case 'happy':
      return (
        <SentimentSatisfiedAltIcon {...iconProps} sx={{ color: 'green' }} />
      );
    case 'sad':
      return (
        <SentimentVeryDissatisfiedIcon {...iconProps} sx={{ color: 'red' }} />
      );
    case 'neutral':
      return <SentimentNeutralIcon {...iconProps} sx={{ color: 'blue' }} />;
    default:
      return null;
  }
};

export { MoodIcon };
