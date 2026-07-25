import Box from '@mui/material/Box';
import type { TransformedPhoto } from 'core/look/query-hooks/types';
import { lazy, Suspense } from 'react';

interface LightboxVideoProps {
  photo: TransformedPhoto;
}

// react-player is CJS; rolldown-vite's prebundle exposes its exports object as
// the ESM default instead of unwrapping `.default`, so unwrap both shapes here
// (same pattern as the watch player).
const ReactPlayer = lazy(async () => {
  const mod = await import('react-player');
  const unwrapped = (mod.default as unknown as { default?: typeof mod.default })
    .default;
  return { default: unwrapped ?? mod.default };
});

// Full-screen video for the viewer. A look video's `source` is an HLS manifest
// (.m3u8); react-player handles it via hls.js. The player fills the viewer and
// the <video> is letterboxed (object-fit: contain) over the solid black, so the
// margins stay black exactly like the still-image lightbox. `light` shows the
// poster with a play glyph first, so opening a video doesn't autoplay or eagerly
// fetch the stream — the viewer taps to start. Mount keyed by photo id so each
// video starts fresh.
const LightboxVideo = (props: LightboxVideoProps) => {
  const { photo } = props;
  const poster = photo.mediumUrl || photo.thumbnailUrl;

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: '100%',
        '& video': { objectFit: 'contain' },
      }}
    >
      <Suspense fallback={null}>
        <ReactPlayer
          url={photo.source ?? undefined}
          controls={true}
          width="100%"
          height="100%"
          light={poster || false}
          playing
          config={{
            file: {
              // Pin a current hls.js — react-player's default (1.1.4) mis-builds
              // the AAC decoder config for some streams, producing garbled audio
              // on desktop. Same fix as the watch player.
              hlsVersion: '1.5.20',
              attributes: {
                playsInline: true, // Important for iOS
              },
            },
          }}
        />
      </Suspense>
    </Box>
  );
};

export { LightboxVideo };
