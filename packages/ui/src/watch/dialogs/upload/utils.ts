import { ValidationResult } from './validation-results';

let cachedCanPlay: ((url: string) => boolean) | null = null;

const loadReactPlayerCanPlay = async () => {
  if (cachedCanPlay) return cachedCanPlay;

  const ReactPlayer = await import('react-player');
  cachedCanPlay = ReactPlayer.default.canPlay;

  return cachedCanPlay;
};

const canPlayUrls = async (urls: string[]): Promise<ValidationResult[]> => {
  const canPlay = await loadReactPlayerCanPlay();

  return Promise.all(
    urls
      .filter(url => url != null)
      .map(url => url!.trim())
      .filter(Boolean)
      .map(async url => ({
        url,
        isValid: await Promise.resolve(canPlay(url)),
      }))
  );
};

export { canPlayUrls };
