# Extension Architecture & Interface Contract

## Overview

This document defines the shared interfaces, message protocols, and data schemas that multiple subtasks depend on. It exists so that SWO-179 (PDF), SWO-180 (Video), SWO-181 (Clipboard), SWO-182 (Popup UI), SWO-184 (Library API), and SWO-185 (Watch API) can be built in parallel with a clear contract — no waiting on each other for type definitions.

**Repos involved:**

| Repo | Path | Role |
|------|------|------|
| `sworld` | `apps/extension/` | Chrome extension (content script, background, popup) |
| `sworld` | `packages/core/` | Shared types, mutation hooks, storage/communication helpers |
| `sworld` | `apps/main/` | Web app pairing page (`/pair`) |
| `sworld-hasura-v2` | `metadata/actions.graphql` | Hasura Action definitions |
| `sworld-backend` | `src/apps/gateway/` | Backend OAuth device flow + content import endpoints |
| `sworld-backend` | `src/services/hasura/` | Backend Hasura client + generated types |

---

## 1. Message Protocol (Content Script ↔ Background ↔ Popup)

Chrome extensions have three isolated contexts. Messages are the only cross-context communication.

### 1.1 Architecture

```
┌──────────────────────┐
│   Content Script     │  Runs in the page context (tab)
│  (per-tab instance)  │  Detects content type, extracts metadata
│                      │  Sends → Background via chrome.runtime.onMessage
└────────┬─────────────┘
         │ chrome.runtime.sendMessage({ type, payload })
         ▼
┌──────────────────────┐
│   Background Script  │  Singleton, always alive
│  (service worker)    │  Routes messages, manages auth, calls APIs
│                      │  Sends → Popup via chrome.runtime.sendMessage
└────────┬─────────────┘
         │ chrome.runtime.sendMessage / chrome.storage.local
         ▼
┌──────────────────────┐
│   Popup (Popup.tsx)  │  Shown on toolbar click, ephemeral
│  (per-click)         │  Reads current tab state, shows UI
│                      │  Sends → Background via chrome.runtime.sendMessage
└──────────────────────┘
```

### 1.2 Message Types (shared enum)

Defined in `packages/core/src/universal/extension/communication/types.ts`:

```typescript
// Discriminated union for all cross-context messages
type ExtensionMessage =
  // ── Content Script → Background ──
  | { source: 'content-script'; target: 'background'; type: 'PAGE_CONTENT_DETECTED'; payload: PageContent }
  | { source: 'content-script'; target: 'background'; type: 'USER_CLIPBOARD_ACTION'; payload: ClipboardContent }
  | { source: 'content-script'; target: 'background'; type: 'PDF_METADATA_EXTRACTED'; payload: PdfMetadata }
  | { source: 'content-script'; target: 'background'; type: 'VIDEO_METADATA_EXTRACTED'; payload: VideoMetadata }
  | { source: 'content-script'; target: 'background'; type: 'CONTENT_IMPORT_REQUEST'; payload: ContentImportRequest }

  // ── Background → Popup ──
  | { source: 'background'; target: 'popup'; type: 'CURRENT_TAB_CONTENT'; payload: PageContent | null }
  | { source: 'background'; target: 'popup'; type: 'IMPORT_STATUS'; payload: ImportStatus }
  | { source: 'background'; target: 'popup'; type: 'AUTH_STATE_CHANGED'; payload: { authenticated: boolean } }

  // ── Popup → Background ──
  | { source: 'popup'; target: 'background'; type: 'REQUEST_TAB_CONTENT' }
  | { source: 'popup'; target: 'background'; type: 'IMPORT_CONTENT'; payload: { contentId: string; targetApp: 'library' | 'watch' } }
  | { source: 'popup'; target: 'background'; type: 'RETRY_IMPORT'; payload: { importId: string } }

  // ── Web App → Extension (external messaging, already exists) ──
  | { type: 'AUTH_TOKEN'; data: string }
  | { type: 'LOGOUT' }
```

### 1.3 Storage keys (chrome.storage.local)

```typescript
interface ExtensionStorage {
  auth0Token: string;           // Already exists. JWT from Auth0 device flow.
  deviceCode: string;           // From OAuth device flow. Temp, cleared after token.
  pairingState: 'pending' | 'authorized' | 'expired';
  importHistory: ImportRecord[]; // Persisted for status/retry
}
```

---

## 2. Content Detection & Parser Data Shapes

These are the return types each parser must implement. Every parser lives in `apps/extension/src/content-scripts/parsers/` and exports a function matching the signature:

```typescript
type ContentParser<T> = () => Promise<{ detected: boolean; metadata?: T; error?: string }>;
```

### 2.1 Page Detection

```typescript
// Detected by SWO-178 content script foundation
type PageType = 'pdf' | 'youtube' | 'vimeo' | 'video-generic' | 'webpage' | 'unknown';
```

The content script injects one of the platform-specific parsers based on URL patterns, then calls the generic fallback if no platform matches.

### 2.2 PdfMetadata (SWO-179)

```typescript
interface PdfMetadata {
  title: string;
  author: string | null;
  pageCount: number;
  creationDate: string | null;    // ISO 8601
  fileUrl: string;                // The PDF URL from the browser
  fileName: string;               // Derived from URL or Content-Disposition
  fileSizeBytes: number | null;
  thumbnailUrl: string | null;    // First page rendered as image (optional)
}
```

### 2.3 VideoMetadata (SWO-180)

```typescript
interface VideoMetadata {
  platform: 'youtube' | 'vimeo' | 'dailymotion' | 'other';
  platformVideoId: string;
  title: string;
  description: string | null;
  durationSeconds: number | null;
  thumbnailUrl: string | null;
  channelName: string | null;
  channelUrl: string | null;
  videoUrl: string;               // Canonical URL
  embedUrl: string | null;        // oEmbed or iframe src
  ogTags: Record<string, string>; // Raw Open Graph tags
}
```

### 2.4 ClipboardContent (SWO-181)

```typescript
interface ClipboardContent {
  type: 'url' | 'text' | 'mixed';
  rawText: string;
  urls: string[];
  detectedContent: (PdfMetadata | VideoMetadata | { type: 'link'; url: string; title: string | null }) | null;
}
```

### 2.5 PageContent (unified, used by Popup UI)

```typescript
interface PageContent {
  pageType: PageType;
  url: string;
  title: string;                  // Document title
  faviconUrl: string | null;
  detectedContent:
    | { type: 'pdf'; metadata: PdfMetadata }
    | { type: 'video'; metadata: VideoMetadata }
    | { type: 'clipboard'; metadata: ClipboardContent }
    | { type: 'webpage'; metadata: WebPageMetadata }
    | null;
}

interface WebPageMetadata {
  description: string | null;
  ogImage: string | null;
  textContent: string;            // First N chars of readable text
}
```

---

## 3. Import & API Contracts

### 3.1 OAuth Device Flow (already implemented, documented for context)

| Step | Direction | Endpoint / Mechanism |
|------|-----------|---------------------|
| 1 | Extension → Hasura (anon) | `mutation createDeviceRequest(input: { extensionId })` → forwarded to `POST /auth/device` |
| 2 | Hasura → Extension | Returns `{ deviceCode, userCode, verificationUri, expiresIn, interval }` |
| 3 | User → Main App | Visits `/pair?code=USERCODE`, authenticates via Auth0, authorizes |
| 4 | Main App → Extension | `chrome.runtime.sendMessage(extensionId, { type: 'AUTH_TOKEN', data: jwt })` |
| 5 | Extension → Hasura (user) | All subsequent GraphQL calls with `Authorization: Bearer <jwt>` |

### 3.2 Import Flow (new — SWO-184, SWO-185)

```
Popup/Content Script → Background (import request)
  → Background calls existing Hasura mutation (insert_videos_one / insert_books_one)
  → Stores result in importHistory
  → Sends IMPORT_STATUS → Popup
```

**Existing GraphQL mutations to use (no new backend endpoints needed):**

**Library (book import)** — `insert_books_one`:

```graphql
mutation InsertBook($object: books_insert_input!) {
  insert_books_one(object: $object) {
    id
    title
    status
  }
}
```

**Watch (video import)** — `insert_videos_one`:

```graphql
mutation InsertVideo($object: videos_insert_input!) {
  insert_videos_one(object: $object) {
    id
    title
    status
  }
}
```

Both are standard Hasura insert mutations — no new Hasura Actions needed. The extension calls them directly via the Hasura GraphQL endpoint with the stored `auth0Token`.

**Input mapping from parser output → DB insert:**

```typescript
// PDF → book
function mapPdfToBookInsert(pdf: PdfMetadata): books_insert_input {
  return {
    title: pdf.title,
    author: pdf.author,
    total_pages: pdf.pageCount,
    file_url: pdf.fileUrl,
    thumbnail_url: pdf.thumbnailUrl,
    source: pdf.fileUrl,
    status: 'ready',
  };
}

// Video → video
function mapVideoToVideoInsert(video: VideoMetadata): videos_insert_input {
  return {
    title: video.title,
    description: video.description,
    video_url: video.videoUrl,
    thumbnail_url: video.thumbnailUrl,
    source: video.platform,
    status: 'ready',
    // metadata: { platformVideoId, channelName, ... }  -- jsonb for extra fields
  };
}
```

### 3.3 Import History & Status

```typescript
interface ImportRecord {
  id: string;                     // UUID
  timestamp: string;              // ISO 8601
  sourceUrl: string;
  targetApp: 'library' | 'watch';
  status: 'pending' | 'success' | 'failed';
  errorMessage?: string;
  resultId?: string;              // The created book/video ID
}

interface ImportStatus {
  importId: string;
  status: 'pending' | 'success' | 'failed';
  message: string;
}
```

---

## 4. File Map (which subtask creates what)

| Subtask | Files created/touched |
|---------|-----------------------|
| **SWO-178** (Content Script) | `apps/extension/src/content-scripts/content.ts` (main injector), `apps/extension/src/content-scripts/detector.ts` (URL pattern → PageType), `apps/extension/manifest.config.js` (add content_scripts), `packages/core/src/universal/extension/communication/types.ts` (message types) |
| **SWO-179** (PDF Parser) | `apps/extension/src/content-scripts/parsers/pdf.ts` (PdfMetadata exporter) |
| **SWO-180** (Video Detectors) | `apps/extension/src/content-scripts/parsers/youtube.ts`, `apps/extension/src/content-scripts/parsers/vimeo.ts` (VideoMetadata exporters) |
| **SWO-181** (Clipboard) | `apps/extension/src/content-scripts/parsers/clipboard.ts` (ClipboardContent exporter), handle paste event in content script |
| **SWO-176** (Auth Manager) | `apps/extension/src/background/auth.ts` (AuthManager class), update `apps/extension/src/background.ts` |
| **SWO-182** (Popup UI) | `apps/extension/src/popup.tsx` (rewrite with full UI), `apps/extension/src/components/` |
| **SWO-183** (Status & Feedback) | `apps/extension/src/components/` (toast/notification components), update popup import history |
| **SWO-184** (Library API) | `apps/extension/src/background/importers/library.ts` (mapPdfToBookInsert + mutation call) |
| **SWO-185** (Watch API) | `apps/extension/src/background/importers/watch.ts` (mapVideoToVideoInsert + mutation call) |
| **SWO-177** (Web Pairing UI) | `apps/main/src/routes/pair.tsx` (new route), `apps/main/src/components/PairPage.tsx` |
| **SWO-174** (Scaffold) | Already exists — manifest, storage, communication, background, popup shell are done |
| **SWO-175** (Backend OAuth) | Already exists — `POST /auth/device`, `device_requests` table, Hasura action are done. Missing SWO-188/189/190 |

---

## 5. Updated Dependency Graph

```
Wave 0 (Foundation — no deps):
  SWO-174 (Scaffold) — DONE
  SWO-175 (Backend OAuth) — PARTIALLY DONE (code generation exists, need SWO-188/189/190)
  └─ SWO-188 (Code gen endpoint) — 0.5d
  └─ SWO-189 (User authorization endpoint) — 0.5d
  └─ SWO-190 (Token polling endpoint) — 0.5d
  SWO-177 (Web Pairing UI) — can start with SWO-188 interface contract

Wave 1 (Extension Core — parallel):
  SWO-178 (Content Script Foundation) — blocked by SWO-174 (done)
  SWO-176 (Auth Manager) — blocked by SWO-175 (wait for SWO-188/189/190 to define contract)

Wave 2 (Parsers — parallel, all blocked by SWO-178):
  SWO-179 (PDF Parser) — blocked by SWO-178
  SWO-180 (Video Detectors) — blocked by SWO-178
  SWO-181 (Clipboard Processor) — blocked by SWO-178

Wave 3 (UI + Importers — parallel):
  SWO-182 (Popup UI) — blocked by SWO-176 + SWO-178
  SWO-184 (Library API) — blocked by SWO-176 + SWO-179
  SWO-185 (Watch API) — blocked by SWO-176 + SWO-180

Wave 4 (Polish):
  SWO-183 (Status & Feedback) — blocked by SWO-182
  SWO-186 (Security & Audit) — blocked by SWO-184 + SWO-185 (but rate limiting should be baked into each endpoint)
```

**Key change from current:** SWO-177 (Pairing UI) doesn't need SWO-175 fully done — it just needs the `/pair` route UI that calls `POST /auth/device/authorize`. It can be built in parallel with SWO-188/189/190 if the `authorize` endpoint contract is frozen first.

---

## 6. Risks & Recommendations

1. **SWO-178 must define the message types first** (in `communication/types.ts`) before SWO-179/180/181 start, otherwise they'll build incompatible parsers. **Recommended:** Make the types file the first PR within SWO-178, or spin it off as its own 15-minute task.
2. **SWO-184/185 don't need new backend endpoints** — they reuse existing `insert_books_one` / `insert_videos_one` Hasura mutations. This simplifies the dependency graph significantly.
3. **SWO-186 security checks (rate limiting, extension ID validation)** should be implemented as middleware on the existing backend routes, not as a separate task at the end. Recommend splitting: rate limiting goes into SWO-175 (already partially commented out there), audit logging into SWO-184/185.
4. **The `manifest.config.js` needs `content_scripts`, `host_permissions`, and `clipboardRead`** permissions added — SWO-178 should update this.
