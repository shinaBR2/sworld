const cardStyles = {
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  boxShadow: 'none',
  bgcolor: 'transparent',
  transition: 'all 0.2s',
  '&:hover': {
    transform: 'scale(1.02)',
    cursor: 'pointer',
  },
} as const;

const durationBadgeStyles = {
  position: 'absolute',
  bottom: 8,
  right: 8,
  bgcolor: 'rgba(0, 0, 0, 0.8)',
  color: 'white',
  px: 1,
  py: 0.5,
  borderRadius: 1,
  fontWeight: 500,
} as const;

const titleStyles = {
  fontWeight: 500,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  mb: 0.5,
  lineHeight: 1.3,
} as const;

export { cardStyles, durationBadgeStyles, titleStyles };
