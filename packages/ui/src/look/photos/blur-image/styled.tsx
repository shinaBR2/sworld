import { styled } from '@mui/material/styles';
import type { ComponentType, ImgHTMLAttributes, Ref } from 'react';

interface FadeInImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  loaded: boolean;
  ref?: Ref<HTMLImageElement>;
}

// The thumbnail fades in over its blur-hash placeholder once decoded by the
// browser. `loaded` is a transient prop, so it must not reach the DOM <img>.
// The explicit ComponentType annotation keeps the emitted type portable
// (avoids a non-portable @mui/system reference in the .d.ts).
const FadeInImage = styled('img', {
  shouldForwardProp: (prop) => prop !== 'loaded',
})<{ loaded: boolean }>(({ loaded }) => ({
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  display: 'block',
  opacity: loaded ? 1 : 0,
  transition: 'opacity 0.4s ease-in',
})) as ComponentType<FadeInImageProps>;

export { FadeInImage };
