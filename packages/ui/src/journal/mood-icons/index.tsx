// packages/ui/src/journal/mood-icons/index.tsx

import SentimentDissatisfiedRoundedIcon from '@mui/icons-material/SentimentDissatisfiedRounded';
import SentimentNeutralRoundedIcon from '@mui/icons-material/SentimentNeutralRounded';
import SentimentVerySatisfiedRoundedIcon from '@mui/icons-material/SentimentVerySatisfiedRounded';
import type { SvgIconProps } from '@mui/material';
import type { MoodType } from 'core/src/journal/types';
import type React from 'react';

interface MoodConfig {
  Icon: React.ComponentType<SvgIconProps>;
  label: string;
  // Theme palette key so the mood reads consistently in light/dark.
  color: 'success' | 'info' | 'error';
}

const MOOD_CONFIG: Record<MoodType, MoodConfig> = {
  happy: {
    Icon: SentimentVerySatisfiedRoundedIcon,
    label: 'Happy',
    color: 'success',
  },
  neutral: {
    Icon: SentimentNeutralRoundedIcon,
    label: 'Neutral',
    color: 'info',
  },
  sad: {
    Icon: SentimentDissatisfiedRoundedIcon,
    label: 'Sad',
    color: 'error',
  },
};

interface MoodIconProps {
  mood: MoodType;
  size?: number;
  className?: string;
}

const MoodIcon: React.FC<MoodIconProps> = ({ mood, size = 24, className }) => {
  const config = MOOD_CONFIG[mood];
  if (!config) {
    return null;
  }

  const { Icon, color } = config;
  return (
    <Icon
      className={className}
      sx={{ width: size, height: size, color: `${color}.main` }}
    />
  );
};

export { MoodIcon, MOOD_CONFIG };
