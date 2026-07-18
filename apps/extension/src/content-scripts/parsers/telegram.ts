import type { TelegramChannelMetadata } from 'core/universal/extension/communication/types';

// Telegram channel detection covers two distinct URL families:
//
// 1. `web.telegram.org` — the web app itself, with three UI variants at different path
//    prefixes: `/k/`, `/a/`, `/z/`. All three address the open chat via a URL hash fragment
//    rather than the pathname, in one of two shapes:
//      - `#@username`   -> public channel/user, identified by username (we keep the '@')
//      - `#<signedInt>` -> private channel/group/user, identified by numeric peer id
//    The `/a/` shape is CONFIRMED by direct observation against the live site:
//      - `https://web.telegram.org/a/#-582839764`  -> a group/channel (negative id)
//      - `https://web.telegram.org/a/#8115119658`  -> a personal/direct chat (positive id)
//    i.e. the sign of the numeric id is the discriminator, matching Telegram's general
//    peer-id convention (positive = user, negative = chat/channel/supergroup).
//
//    TODO(SWO-492): `/k/` and `/z/` are NOT independently confirmed against the live site —
//    they're assumed to share the same hash scheme as `/a/` based on published examples
//    (e.g. `web.telegram.org/z/#-1782626220`) and Telegram's general peer-id convention, but
//    this should be verified against a live web.telegram.org/k/ and /z/ channel before being
//    fully trusted. If either variant turns out to differ, only `getVariant`/this comment and
//    the regexes below need updating — the dispatch logic in content.ts stays the same.
//
// 2. `t.me` — Telegram's public sharing domain, confirmed by direct observation:
//      - `https://t.me/<username>`           -> public channel link
//      - `https://t.me/<username>/s/<msgId>` -> "single post preview" link, from a channel
//        post's "Copy Post Link"/Share action, e.g. `https://t.me/ngocmaicutiiii/s/3`
//    channelId for `t.me` links is the BARE username (no '@'), unlike the web.telegram.org
//    hash form above — kept distinct per-source rather than normalized, since the backend
//    (SWO-494) resolves either username form the same way (Telethon/teleproto's `getEntity`
//    accepts both '@username' and bare 'username'). Other `t.me` path shapes (`/c/...`,
//    `/joinchat/...`, `/+invite`, `/share`, bot deep links, etc.) are intentionally NOT
//    parsed here — out of this sub-task's scope. They safely fall through to an undetected
//    channelId, so no message is sent for them (see content.ts).
//
// Convention for `channelId` (relied on by SWO-494's gateway lookup): the raw identifier as
// it appears in the URL — sign included for numeric peer ids (e.g. '-582839764'), '@'-prefixed
// for web.telegram.org usernames (e.g. '@somechannel'), bare for t.me usernames (e.g.
// 'somechannel'). No normalization (no '-100' prefixing, no '@' stripping/adding) happens
// here — that's an MTProto-resolution concern for the backend, not URL parsing.

const TELEGRAM_VARIANT_RE = /^\/(k|a|z)\//;

type TelegramVariant = 'k' | 'a' | 'z';

const getVariant = (pathname: string): TelegramVariant | undefined => {
  const match = pathname.match(TELEGRAM_VARIANT_RE);
  return match ? (match[1] as TelegramVariant) : undefined;
};

const USERNAME_HASH_RE = /^#@([a-zA-Z0-9_]{5,32})(?:[/_]\d+)?$/;
const NUMERIC_HASH_RE = /^#(-?\d+)(?:[/_]\d+)?$/;

const getChannelIdFromHash = (hash: string): string | undefined => {
  const usernameMatch = hash.match(USERNAME_HASH_RE);
  if (usernameMatch) return `@${usernameMatch[1]}`;

  const numericMatch = hash.match(NUMERIC_HASH_RE);
  if (numericMatch) {
    const peerId = numericMatch[1];
    // Positive peer ids are personal/direct chats (users) — out of scope for SWO-490,
    // which only imports from channels. Only negative (group/channel) ids qualify.
    if (!peerId.startsWith('-')) return undefined;
    return peerId;
  }

  return undefined;
};

// Standard Telegram usernames are 5-32 chars, alphanumeric + underscore, starting with a
// letter. This also happens to exclude single-segment reserved t.me keywords too short to
// be a username (e.g. 'c'), though longer reserved words (e.g. 'joinchat', 'share') aren't
// specifically filtered — they're expected to always appear with additional path segments
// this regex doesn't match, so they fall through safely as an undetected channel.
const TME_PATH_RE = /^\/([A-Za-z][A-Za-z0-9_]{4,31})(?:\/s\/(\d+))?\/?$/;

type TmeChannel = { channelId?: string; messageId?: string };

const getChannelFromTmePath = (pathname: string): TmeChannel => {
  const match = pathname.match(TME_PATH_RE);
  if (!match) return {};
  return { channelId: match[1], messageId: match[2] };
};

const isTmeHostname = (hostname: string): boolean =>
  hostname === 't.me' || hostname === 'www.t.me';

const extractTelegramMetadata = (): TelegramChannelMetadata => {
  if (typeof window === 'undefined') {
    return { url: '' };
  }

  const { hostname, pathname, hash, href } = window.location;

  if (isTmeHostname(hostname)) {
    const { channelId, messageId } = getChannelFromTmePath(pathname);
    return { url: href, channelId, messageId };
  }

  const variant = getVariant(pathname);
  const channelId = getChannelIdFromHash(hash);

  return { url: href, channelId, variant };
};

export {
  extractTelegramMetadata,
  getChannelFromTmePath,
  getChannelIdFromHash,
  getVariant,
  isTmeHostname,
};
