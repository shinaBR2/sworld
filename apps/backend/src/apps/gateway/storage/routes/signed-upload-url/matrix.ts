import { randomUUID } from 'node:crypto';

interface UploadRule {
  /** Top-level storage prefix — resource-specific, not site-specific. */
  prefix: string;
  /** Allowed content-type prefixes/exacts; the request contentType must startWith one. */
  allow: string[];
}

/**
 * (site, action) → storage rule. Single source of truth for where each kind of
 * upload lands and what it may contain. An unknown (site, action) is rejected.
 *
 * Prefixes are resource-specific (e.g. watch playlist thumbs → `videoPlaylists`,
 * leaving room for a future `audioPlaylists`) and intentionally diverge from the
 * heterogeneous legacy bucket layout — new uploads normalize to one scheme.
 */
const UPLOAD_MATRIX: Record<string, Record<string, UploadRule>> = {
  watch: {
    VIDEO_UPLOAD: { prefix: 'videos', allow: ['video/'] },
    VIDEO_THUMBNAIL_UPLOAD: { prefix: 'videos', allow: ['image/'] },
    PLAYLIST_THUMBNAIL_UPLOAD: { prefix: 'videoPlaylists', allow: ['image/'] },
  },
  listen: {
    AUDIO_UPLOAD: { prefix: 'audios', allow: ['audio/'] },
  },
  main: {
    BOOK_UPLOAD: { prefix: 'books', allow: ['application/pdf'] },
  },
};

/** Content-type → extension overrides; otherwise the MIME subtype is used. */
const EXT_OVERRIDES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'audio/mpeg': 'mp3',
  'audio/mp4': 'm4a',
  'video/quicktime': 'mov',
  'video/x-matroska': 'mkv',
  'application/pdf': 'pdf',
};

const extFromContentType = (contentType: string) =>
  EXT_OVERRIDES[contentType] ?? contentType.split('/')[1] ?? 'bin';

interface ResolveObjectPathParams {
  site: string;
  action: string;
  contentType: string;
  userId: string;
  id?: string;
}

/**
 * Build the normalized object path for an upload, or throw if the
 * (site, action) pair is unknown or the content type isn't allowed for it.
 *
 * Path: `<prefix>/<userId>/<id ?? uuid>/<uuid>.<ext>` — never trusts a client
 * path; `userId` is the session user, the filename is always server-generated.
 */
const resolveObjectPath = ({
  site,
  action,
  contentType,
  userId,
  id,
}: ResolveObjectPathParams) => {
  const rule = UPLOAD_MATRIX[site]?.[action];
  if (!rule) {
    throw new Error(`Unsupported upload (site="${site}", action="${action}")`);
  }
  if (!rule.allow.some((prefix) => contentType.startsWith(prefix))) {
    throw new Error(
      `Content type "${contentType}" is not allowed for action "${action}"`,
    );
  }

  const entityKey = id ?? randomUUID();
  const fileName = `${randomUUID()}.${extFromContentType(contentType)}`;
  return `${rule.prefix}/${userId}/${entityKey}/${fileName}`;
};

export {
  UPLOAD_MATRIX,
  extFromContentType,
  resolveObjectPath,
  type UploadRule,
};
