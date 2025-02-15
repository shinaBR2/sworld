import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { CSSProperties } from 'react';

// Constants
export const THUMBNAIL_HEIGHT = 64;
export const THUMBNAIL_WIDTH = (THUMBNAIL_HEIGHT / 9) * 16;

// Shared styles
export const thumbnailImgStyle: CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
};

// Styled components
const ListItemContainer = styled(Box, {
  shouldForwardProp: prop => prop !== 'isActive',
})<{ isActive?: boolean }>(({ theme, isActive }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  paddingTop: theme.spacing(1),
  paddingBottom: theme.spacing(1),
  paddingLeft: 0,
  paddingRight: 0,
  backgroundColor: isActive ? theme.palette.action.selected : 'transparent',
  borderLeft: isActive ? `4px solid ${theme.palette.primary.main}` : '4px solid transparent',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    '& .play-icon': {
      opacity: 1,
    },
  },
})) as typeof Box;

const ThumbnailContainer = styled(Box)({
  position: 'relative',
  flexShrink: 0,
}) as typeof Box;

const ThumbnailWrapper = styled(Box)(({ theme }) => ({
  width: THUMBNAIL_WIDTH,
  height: THUMBNAIL_HEIGHT,
  objectFit: 'cover',
  borderRadius: theme.spacing(2 / 3),
  overflow: 'hidden',
  position: 'relative',
})) as typeof Box;

const PlayIconOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  opacity: 0,
  transition: 'opacity 0.2s',
  borderRadius: theme.spacing(1),
})) as typeof Box;

const ProgressBar = styled(Box)({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  height: 2,
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
}) as typeof Box;

const Progress = styled(Box)({
  height: '100%', // bgColor
}) as typeof Box;

const DurationLabel = styled(Typography)(({ theme }) => ({
  position: 'absolute',
  bottom: theme.spacing(0.5),
  right: theme.spacing(0.5),
  backgroundColor: 'rgba(0, 0, 0, 0.8)',
  color: 'white',
  padding: theme.spacing(0, 0.5),
  borderRadius: 4,
  fontSize: '0.75rem',
})) as typeof Typography;

const TitleText = styled(Typography)({
  fontWeight: 500,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
}) as typeof Typography;

const UsernameText = styled(Typography)({
  display: 'block',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
}) as typeof Typography;

// Skeleton styles
const SkeletonContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  paddingTop: theme.spacing(1),
  paddingBottom: theme.spacing(1),
  marginLeft: theme.spacing(2),
  marginRight: theme.spacing(2),
})) as typeof Box;

const SkeletonThumbnail = styled(Box)({
  position: 'relative',
  flexShrink: 0,
}) as typeof Box;

const SkeletonContent = styled(Box)({
  minWidth: 0,
  flex: 1,
}) as typeof Box;

export {
  ListItemContainer,
  ThumbnailContainer,
  ThumbnailWrapper,
  PlayIconOverlay,
  ProgressBar,
  Progress,
  DurationLabel,
  TitleText,
  UsernameText,
  SkeletonContainer,
  SkeletonThumbnail,
  SkeletonContent,
};
