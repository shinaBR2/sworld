import { ValidationResult } from './validation-results';

let cachedCanPlay: ((url: string) => boolean) | null = null;

const loadReactPlayerCanPlay = async () => {
  if (cachedCanPlay) return cachedCanPlay;

  const ReactPlayer = await import('react-player');
  cachedCanPlay = ReactPlayer.default.canPlay;

  return cachedCanPlay;
};

const validateUrls = async (urls: string[]): Promise<ValidationResult[]> => {
  const canPlay = await loadReactPlayerCanPlay();

  return urls
    .filter(url => url != null)
    .map(url => url.trim())
    .filter(Boolean)
    .map(url => ({
      url,
      isValid: canPlay(url),
    }));
};

export { validateUrls };
