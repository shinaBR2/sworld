import Stack from '@mui/material/Stack';
import { useEffect, useMemo, useRef, useState } from 'react';
import { blurHashToDataUri } from './blurhash';
import { FadeInImage } from './styled';

interface BlurImageProps {
  src: string;
  alt: string;
  blurHash?: string;
}

// A lazy image that shows its blur-hash placeholder first and fades to the
// real thumbnail once it loads. Fills its positioned parent (the photo card),
// which reserves the space — so there is no layout shift on load.
const BlurImage = (props: BlurImageProps) => {
  const { src, alt, blurHash } = props;
  const imgRef = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);

  const placeholder = useMemo(
    () => (blurHash ? blurHashToDataUri(blurHash) : undefined),
    [blurHash],
  );

  // A cached thumbnail can finish loading before React attaches `onLoad`, so
  // the event never fires and the image would stay pinned at opacity 0 behind
  // the placeholder. Catch that on mount. `naturalWidth > 0` excludes a cached
  // error (complete is true for those too) so a broken image stays hidden.
  useEffect(() => {
    const img = imgRef.current;
    if (img?.complete && img.naturalWidth > 0) {
      setLoaded(true);
    }
  }, []);

  return (
    <Stack
      sx={{
        position: 'absolute',
        inset: 0,
        bgcolor: 'action.hover',
        backgroundImage: placeholder ? `url(${placeholder})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <FadeInImage
        ref={imgRef}
        src={src}
        alt={alt}
        loading="lazy"
        loaded={loaded}
        onLoad={() => setLoaded(true)}
      />
    </Stack>
  );
};

export { BlurImage };
