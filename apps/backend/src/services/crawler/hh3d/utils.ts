import { videoUrlXHRUrl } from './selectors';

const videoUrlXHRMatcher = (url: string) => {
  return url.includes(videoUrlXHRUrl);
};

export { videoUrlXHRMatcher };
