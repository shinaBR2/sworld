import { defineManifest } from '@crxjs/vite-plugin';

export default defineManifest({
  manifest_version: 3,
  name: 'CRXJS from scratch',
  version: '1.0.0',
  action: {
    default_popup: 'src/popup.html',
    type: 'module',
  },
  background: {
    service_worker: 'src/background.ts',
    type: 'module',
  },
  permissions: ['storage'],
  externally_connectable: {
    matches: ['https://shinabr2.com/*', 'http://localhost:3000/*'],
  },
});
