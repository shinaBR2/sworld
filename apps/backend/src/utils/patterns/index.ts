/**
 * https://github.com/cookpete/react-player/blob/master/src/patterns.js
 * IT'S IMPORTANT TO KEEP THIS IN SYNC WITH REACT-PLAYER VERSION ON FRONTEND
 */
const urlPatterns = {
  youtube:
    /(?:youtu\.be\/|youtube(?:-nocookie|education)?\.com\/(?:embed\/|v\/|watch\/|watch\?v=|watch\?.+&v=|shorts\/|live\/))((\w|-){11})|youtube\.com\/playlist\?list=|youtube\.com\/user\//,
  soundcloud: /(?:soundcloud\.com|snd\.sc)\/[^.]+$/,
  vimeo: /vimeo\.com\/(?!progressive_redirect).+/,
  mux: /stream\.mux\.com\/(?!\w+\.m3u8)(\w+)/,
  facebook:
    /^https?:\/\/(www\.)?facebook\.com.*\/(video(s)?|watch|story)(\.php?|\/).+$/,
  facebookWatch: /^https?:\/\/fb\.watch\/.+$/,
  streamable: /streamable\.com\/([a-z0-9]+)$/,
  wistia:
    /(?:wistia\.(?:com|net)|wi\.st)\/(?:medias|embed)\/(?:iframe\/)?([^?]+)/,
  twitchVideo: /(?:www\.|go\.)?twitch\.tv\/videos\/(\d+)($|\?)/,
  twitchChannel: /(?:www\.|go\.)?twitch\.tv\/([a-zA-Z0-9_]+)($|\?)/,
  dailymotion:
    /^(?:(?:https?):)?(?:\/\/)?(?:www\.)?(?:(?:dailymotion\.com(?:\/embed)?\/video)|dai\.ly)\/([a-zA-Z0-9]+)(?:_[\w_-]+)?(?:[\w.#_-]+)?/,
  mixcloud: /mixcloud\.com\/([^/]+\/[^/]+)/,
  vidyard: /vidyard.com\/(?:watch\/)?([a-zA-Z0-9-_]+)/,
  kaltura:
    /^https?:\/\/[a-zA-Z]+\.kaltura.(com|org)\/p\/([0-9]+)\/sp\/([0-9]+)00\/embedIframeJs\/uiconf_id\/([0-9]+)\/partner_id\/([0-9]+)(.*)entry_id.([a-zA-Z0-9-_].*)$/,
} as const;

const fileExtensionPatterns = {
  video: /\.(mp4|mov|m4v|ts)($|\?)/i, // Only formats compatible with HLS -codec copy
  hls: /\.(m3u8)($|\?)/i, // For direct HLS URLs that will be handled separately
} as const;

type Platform = keyof typeof urlPatterns;
type FileType = keyof typeof fileExtensionPatterns;

export { type Platform, type FileType, urlPatterns, fileExtensionPatterns };
