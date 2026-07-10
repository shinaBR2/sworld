import { defineManifest } from '@crxjs/vite-plugin';

export default defineManifest({
  manifest_version: 3,
  name: 'SWorld',
  version: '1.0.0',
  action: {
    default_popup: 'src/popup.html',
    type: 'module',
  },
  background: {
    service_worker: 'src/background.ts',
    type: 'module',
  },
  content_scripts: [
    {
      matches: ['<all_urls>'],
      js: ['src/content-scripts/content.ts'],
      run_at: 'document_idle',
    },
  ],
  permissions: ['storage', 'clipboardRead'],
  host_permissions: ['<all_urls>'],
  externally_connectable: {
    matches: ['https://shinabr2.com/*', 'http://localhost:3000/*'],
  },
});
