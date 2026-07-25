import { styled } from '@mui/material/styles';
import type { ComponentType, ImgHTMLAttributes, Ref } from 'react';

interface LightboxImageLayerProps extends ImgHTMLAttributes<HTMLImageElement> {
  loaded: boolean;
  ref?: Ref<HTMLImageElement>;
}

// A full-frame image layer that fades in once loaded. `contain` (not `cover`)
// so the whole photo is visible, letterboxed. `loaded` is a transient prop kept
// off the DOM; the ComponentType cast keeps the emitted type portable.
const LightboxImageLayer = styled('img', {
  shouldForwardProp: (prop) => prop !== 'loaded',
})<{ loaded: boolean }>(({ loaded }) => ({
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  objectFit: 'contain',
  display: 'block',
  opacity: loaded ? 1 : 0,
  transition: 'opacity 0.4s ease-in',
})) as ComponentType<LightboxImageLayerProps>;

export { LightboxImageLayer };
