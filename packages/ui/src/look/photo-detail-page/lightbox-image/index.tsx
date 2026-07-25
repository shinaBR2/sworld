import Stack from '@mui/material/Stack';
import type { TransformedPhoto } from 'core/look/query-hooks/types';
import { useEffect, useMemo, useRef, useState } from 'react';
import { blurHashToDataUri } from '../../photos/blur-image/blurhash';
import { LightboxImageLayer } from './styled';

interface LightboxImageProps {
  photo: TransformedPhoto;
}

// Progressive full-screen image: the blur-hash placeholder shows immediately,
// the medium resolution fades in over it, then the full original fades in on
// top once loaded. Mount this keyed by photo id so each photo starts fresh.
const LightboxImage = (props: LightboxImageProps) => {
  const { photo } = props;
  const previewRef = useRef<HTMLImageElement>(null);
  const fullRef = useRef<HTMLImageElement>(null);
  const [previewLoaded, setPreviewLoaded] = useState(false);
  const [fullLoaded, setFullLoaded] = useState(false);

  const placeholder = useMemo(
    () => blurHashToDataUri(photo.blurHash),
    [photo.blurHash],
  );

  const previewSrc = photo.mediumUrl || photo.thumbnailUrl;
  const fullSrc = photo.source || previewSrc;
  const alt = photo.slug ?? 'Photo';

  // A cached image can finish loading before React attaches onLoad, leaving the
  // layer pinned at opacity 0. Catch that on mount. naturalWidth > 0 excludes a
  // cached error so a broken image stays hidden.
  useEffect(() => {
    const preview = previewRef.current;
    if (preview?.complete && preview.naturalWidth > 0) {
      setPreviewLoaded(true);
    }
    const full = fullRef.current;
    if (full?.complete && full.naturalWidth > 0) {
      setFullLoaded(true);
    }
  }, []);

  return (
    <Stack
      sx={{
        position: 'relative',
        width: '100%',
        height: '100%',
        backgroundImage: placeholder ? `url(${placeholder})` : undefined,
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
      }}
    >
      <LightboxImageLayer
        ref={previewRef}
        src={previewSrc}
        alt=""
        loaded={previewLoaded}
        onLoad={() => setPreviewLoaded(true)}
      />
      <LightboxImageLayer
        ref={fullRef}
        src={fullSrc}
        alt={alt}
        loaded={fullLoaded}
        onLoad={() => setFullLoaded(true)}
      />
    </Stack>
  );
};

export { LightboxImage };
